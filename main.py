import warnings
from pathlib import Path
from PIL import Image
import torch
from transformers import (
    Blip2Processor,
    Blip2ForConditionalGeneration,
    AutoTokenizer,
    AutoModelForCausalLM,
    AutoImageProcessor,
    AutoModelForImageClassification
)   
import ollama


# Configurações iniciais
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
warnings.filterwarnings("ignore")

# Carregar modelos uma única vez para melhorar performance

# BLIP-2
BLIP2_MODEL_NAME = "Salesforce/blip2-opt-2.7b"
try:
    blip2_processor = Blip2Processor.from_pretrained(
        BLIP2_MODEL_NAME,
        use_fast=False 
    )
    blip2_model = (
        Blip2ForConditionalGeneration
        .from_pretrained(BLIP2_MODEL_NAME, torch_dtype=torch.float16, local_files_only=True)
        .to(device)
    )
except Exception as e:
    raise RuntimeError(f"Falha ao carregar BLIP-2: {e}")

# Classificador de lesão: SkinCancer-Classifier
SKIN_MODEL_NAME = "NeuronZero/SkinCancerClassifier"
skin_cancer_classes = {
    "AK":   "Actinic Keratosis (ceratose actínica)",
    "BCC":  "Basal Cell Carcinoma (carcinoma basocelular)",
    "BKL":  "Benign Keratosis‑Like Lesion (lesão queratósica benigna)",
    "DF":   "Dermatofibroma",
    "MEL":  "Melanoma",
    "NV":   "Melanocytic Nevus (nevo melanocítico)",
    "SCC":  "Squamous Cell Carcinoma (carcinoma de células escamosas)",
    "VASC": "Vascular Lesion (lesão vascular)"
}

try:
    skin_processor = AutoImageProcessor.from_pretrained(
        SKIN_MODEL_NAME, use_fast=True
    )
    skin_model = (
        AutoModelForImageClassification
        .from_pretrained(SKIN_MODEL_NAME)
        .to(device)
    )
except Exception as e:
    raise RuntimeError(f"Falha ao carregar classificador de pele: {e}")


def gerar_descricao_imagem(image_path: Path) -> str:
    #Gera descrição detalhada da lesão usando o modelo BLIP-2.

    image = Image.open(image_path).convert("RGB")
    prompt = (
        "Question: Provide a comprehensive clinical description of the skin lesion depicted in the image, detailing the following aspects:\n"
        "- Morphology (e.g., macule, papule, plaque, nodule, vesicle, pustule)\n"
        "- Size and shape\n"
        "- Color and pigmentation patterns\n"
        "- Border characteristics (well-defined or ill-defined)\n"
        "- Surface features (e.g., scaling, crusting, ulceration)\n"
        "- Texture (e.g., smooth, rough, indurated)\n"
        "- Distribution and anatomical location\n"
        "- Presence of secondary changes (e.g., lichenification, atrophy)\n"
        "- Any additional notable features\n"
        "Answer:"
    )

    inputs = blip2_processor(
        image, text=prompt, return_tensors="pt"
    ).to(device)
    output = blip2_model.generate(
        **inputs,
        max_new_tokens=150,
        temperature=0.7,
        top_p=0.9,
        top_k=50,
        repetition_penalty=1.2, 
        pad_token_id=blip2_processor.tokenizer.eos_token_id
    )

    decoded = blip2_processor.decode(
        output[0], skip_special_tokens=True
    )

    # Extrair resposta após 'Answer:'
    return decoded.split("Answer:")[-1].strip()

def gerar_laudo_clinicollama(descricao: str, diagnostico: str, confianca: float) -> str:
    #Gera laudo clínico completo usando llama3.2.
    prompt = (
        f"""Você é um especialista em dermatologia especializado em oncologia cutânea. 
        Com base na descrição da imagem da lesão cutânea e no diagnóstico preliminar fornecidos, 
        elabore um laudo completo e estruturado de forma textual separada em paragrafos sem titulos como uma redação, incluindo:
        descreva o diagnostico da imagem apartir das caracteristicas a seguir:
        **Descrição da Imagem**: {descricao}
        **Diagnóstico Preliminar**: {diagnostico}
        **Confiança do Modelo**: {confianca*100:.1f}%
        Elabore o laudo de forma clara, concisa e utilizando uma linguagem técnica apropriada para profissionais de saúde, 
        """
    )
    response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": prompt}])

    try:
        resposta = response['message']['content']
    except KeyError:
        resposta = response['message']

    return resposta

def classificar_lesao(image_path: Path) -> tuple[str, float]:
    #Classifica a lesão cutânea e retorna o código da classe e a confiança.
    image = Image.open(image_path).convert("RGB")
    inputs = skin_processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = skin_model(**inputs)
    probas = torch.nn.functional.softmax(outputs.logits, dim=-1)
    confianca, pred_id = torch.max(probas, dim=-1)
    code = skin_model.config.id2label[pred_id.item()]
    return code, confianca.item()


if __name__ == "__main__":
    # Exemplo de execução
    img_path = Path(r"C:\Users\mathe\Downloads\pibic\ISIC_2019\training\AK\ISIC_0024468.jpg") 
    
    # 1. Classificação
    code, conf = classificar_lesao(img_path)
    desc = gerar_descricao_imagem(img_path)
    laudo = gerar_laudo_clinicollama(desc, skin_cancer_classes[code], conf)

    print(f"\n🔬 Diagnóstico: {code} ({conf*100:.1f}% de confiança)")
    print(f"\n📝 Descrição da Imagem:\n{desc}\n")
    print(f"\n{laudo}\n")


