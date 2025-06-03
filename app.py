# app.py
import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from pathlib import Path
import tempfile

# Importa as funções do seu main.py
try:
    from main import (
        classificar_lesao,
        gerar_descricao_imagem,
        gerar_laudo_clinicollama,
        skin_cancer_classes,
    )
except ImportError as e:
    print("WARNING: Não foi possível importar funções de main.py:", e)
    raise

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Derm AI API is running!"


@app.route("/predict", methods=["POST"])
def predict():
    # 1) Verifica se veio o arquivo "image"
    if "image" not in request.files:
        return jsonify({"error": "Nenhum arquivo de imagem enviado"}), 400

    image_file = request.files["image"]
    if image_file.filename == "":
        return jsonify({"error": "Arquivo sem nome"}), 400

    # 2) Verifica se é realmente uma imagem (baseado no mimetype)
    if not image_file.mimetype.startswith("image/"):
        return jsonify({"error": "Tipo de arquivo inválido (esperado imagem)"}), 400

    try:
        # Lê os bytes e carrega como PIL Image
        image_bytes = image_file.read()
        image_stream = io.BytesIO(image_bytes)
        image_pil = Image.open(image_stream).convert("RGB")

        # Salva temporariamente em disco (porque as funções do main.py usam Path)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            image_pil.save(tmp.name)
            temp_image_path = Path(tmp.name)

        # ─── 1) Classificar a lesão ─────────────────────────────────────────────────
        code, conf = classificar_lesao(temp_image_path)
        # converte o código para nome completo da classe
        diagnostico_completo = skin_cancer_classes.get(code, code)

        # ─── 2) Gerar descrição da imagem com BLIP-2 ───────────────────────────────
        desc = gerar_descricao_imagem(temp_image_path)

        # ─── 3) Gerar laudo clínico com llama3.2 ────────────────────────────────────
        laudo = gerar_laudo_clinicollama(desc, diagnostico_completo, conf)

        # ─── 4) Remove o arquivo temporário ─────────────────────────────────────────
        os.unlink(temp_image_path)

        # ─── 5) Monta as três saídas em strings, idênticas ao que seu main.py imprime:
        #  5.1) Linha de diagnóstico:
        diagnostico_text = f"🔬 Diagnóstico: {code} ({conf*100:.1f}% de confiança)"

        #  5.2) Bloco de descrição (já inclui o emoji e quebra de linha):
        descricao_text = f"📝 Descrição da Imagem:\n{desc}"

        #  5.3) Laudo clínico (já é o texto retornado pelo Llama):
        laudo_text = laudo.strip()

        # ─── 6) Retorna JSON com as três chaves, nesta ordem:
        return jsonify({
            "diagnostico_text": diagnostico_text,
            "descricao_text": descricao_text,
            "laudo_text": laudo_text
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro na predição: {str(e)}"}), 500


if __name__ == "__main__":
    # ─── Carrega modelos apenas no processo “filho” (quando Flask está em debug+reloader) ─────
    #
    # Usando WERKZEUG_RUN_MAIN nos certificamos de carregar Blip2 e SkinClassifier
    # somente uma vez, no processo que atende as requisições, e não no “watcher” que
    # fica monitorando alterações nos arquivos.
    #
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        print("Loading AI models no processo filho...")
        try:
            from main import blip2_processor, blip2_model, skin_processor, skin_model
            print("Models loaded successfully.")
        except Exception as ex:
            print(f"Falha ao carregar modelos: {ex}")
            # Se quiser interromper a inicialização:
            # import sys; sys.exit(1)

    # Roda o servidor Flask. Em debug=True ele continua recarregando, mas sem recarregar
    # modelos (já que se carrega só quando WERKZEUG_RUN_MAIN == "true").
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=True)
