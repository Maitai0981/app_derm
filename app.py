import os
import io
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from pathlib import Path

# Importa funções do main.py
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
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def home():
    return "Derm AI API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Nenhum arquivo de imagem enviado"}), 400

    image_file = request.files["image"]
    if not image_file or image_file.filename == "":
        return jsonify({"error": "Arquivo sem nome"}), 400

    if not image_file.mimetype.startswith("image/"):
        return jsonify({"error": "Tipo de arquivo inválido (esperado imagem)"}), 400

    temp_image_path = None
    try:
        # Lê os bytes da imagem
        image_bytes = image_file.read()
        image_stream = io.BytesIO(image_bytes)

        # Verifica se é imagem válida
        image_pil = Image.open(image_stream).convert("RGB")
        image_pil.verify()
        image_stream.seek(0)
        image_pil = Image.open(image_stream).convert("RGB")  # Reabre após verify

        # Salva imagem temporariamente no disco
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            image_pil.save(tmp.name)
            temp_image_path = Path(tmp.name)

        # Classificação
        code, conf = classificar_lesao(temp_image_path)
        diagnostico_completo = skin_cancer_classes.get(code, code)

        # Descrição com BLIP-2
        desc = gerar_descricao_imagem(temp_image_path)

        # Geração do laudo com LLaMA
        laudo = gerar_laudo_clinicollama(desc, diagnostico_completo, conf)

        # Construção das respostas
        diagnostico_text = f"🔬 Diagnóstico: {code} ({conf * 100:.1f}% de confiança)"
        descricao_text = f"📝 Descrição da Imagem:\n{desc}"
        laudo_text = laudo.strip()

        return jsonify({
            "diagnostico_text": diagnostico_text,
            "descricao_text": descricao_text,
            "laudo_text": laudo_text
        }), 200

    except Exception as e:
        print(f"[ERRO] Falha na predição: {e}")
        return jsonify({"error": f"Erro na predição: {str(e)}"}), 500

    finally:
        if temp_image_path and temp_image_path.exists():
            os.unlink(temp_image_path)

if __name__ == "__main__":
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        print("Loading AI models no processo filho...")
        try:
            from main import blip2_processor, blip2_model, skin_processor, skin_model
            print("Models loaded successfully.")
        except Exception as ex:
            print(f"Falha ao carregar modelos: {ex}")
            # import sys; sys.exit(1)

    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=True)
