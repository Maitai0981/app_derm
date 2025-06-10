# ========================== #
#        IMPORTAÇÕES         #
# ========================== #

import warnings
from pathlib import Path
from PIL import Image
import torch

from transformers import (
    Blip2Processor,
    Blip2ForConditionalGeneration,
    AutoImageProcessor,
    AutoModelForImageClassification
)

import ollama

# ========================== #
#     CONFIGURAÇÕES GERAIS   #
# ========================== #

warnings.filterwarnings("ignore")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ========================== #
#         MODELOS            #
# ========================== #

# ----- BLIP-2 (Descrição da imagem) -----

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

# ----- Classificador de Câncer de Pele -----

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


# ========================== #
#     FUNÇÕES PRINCIPAIS   #
# ========================== #

def gerar_descricao_imagem(image_path: Path) -> str:
    """
    Gera descrição clínica detalhada da lesão usando BLIP-2.
    """
    image = Image.open(image_path).convert("RGB")

    prompt = (
        "resposta em portugues"
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

    inputs = blip2_processor(image, text=prompt, return_tensors="pt").to(device)

    output = blip2_model.generate(
        **inputs,
        max_new_tokens=150,
        temperature=0.7,
        top_p=0.9,
        top_k=50,
        repetition_penalty=1.2,
        pad_token_id=blip2_processor.tokenizer.eos_token_id
    )

    decoded = blip2_processor.decode(output[0], skip_special_tokens=True)
    return decoded.split("Answer:")[-1].strip()


def classificar_lesao(image_path: Path) -> tuple[str, float]:
    """
    Classifica a lesão cutânea e retorna o código da classe e a confiança.
    """
    image = Image.open(image_path).convert("RGB")
    inputs = skin_processor(images=image, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = skin_model(**inputs)

    probas = torch.nn.functional.softmax(outputs.logits, dim=-1)
    confianca, pred_id = torch.max(probas, dim=-1)

    code = skin_model.config.id2label[pred_id.item()]
    return code, confianca.item()


def gerar_laudo_clinicollama(descricao: str, diagnostico: str, confianca: float) -> str:
    """
    Gera um laudo clínico com base na descrição da imagem e no diagnóstico preliminar.
    """
    prompt = (
        f"You are a dermatologist specialized in skin oncology. "
        f"Based on the description of the skin lesion image and the preliminary diagnosis provided, "
        f"write a complete and structured clinical report in the form of a cohesive text, organized in paragraphs without titles, "
        f"as if it were a medical essay. Describe the diagnosis of the image using the following characteristics:\n\n"
        f"**Image Description**: {descricao}\n"
        f"**Preliminary Diagnosis**: {diagnostico}\n"
        f"**Model Confidence**: {confianca*100:.1f}%\n\n"
        f"Write the report in a clear, concise manner using technical language appropriate for healthcare professionals."
        f"saida em portugues brasileiro"
    )



    response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": prompt}])

    try:
        resposta = response['message']['content']
    except KeyError:
        resposta = response['message']

    return resposta


# ========================== #
#       EXECUÇÃO PRINCIPAL   #
# ========================== #

if __name__ == "__main__":
    img_path = Path(r"C:\Users\mathe\Downloads\pibic\ISIC_2019\training\AK\ISIC_0024468.jpg")

    # 1. Classificar lesão
    code, conf = classificar_lesao(img_path)

    # 2. Gerar descrição detalhada
    desc = gerar_descricao_imagem(img_path)

    # 3. Gerar laudo clínico completo
    laudo = gerar_laudo_clinicollama(desc, skin_cancer_classes[code], conf)

    # 4. Exibir resultados
    print(f"\n🔬 Diagnóstico: {skin_cancer_classes[code]} ({conf*100:.1f}% de confiança)")
    print(f"\n📝 Descrição da Imagem:\n{desc}\n")
    print(f"\n{laudo}\n")
