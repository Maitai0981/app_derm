# download_model.py
from huggingface_hub import snapshot_download
import shutil

# Apagar cache existente
shutil.rmtree("model_cache", ignore_errors=True)

# Baixar arquivos essenciais
snapshot_download(
    repo_id="Salesforce/blip2-opt-2.7b",
    allow_patterns=[
        "config.json",
        "preprocessor_config.json",
        "model.safetensors",
        "tokenizer_config.json",
        "vocab.json",
        "merges.txt",
        "special_tokens_map.json"
    ],
    local_dir="model_cache",
    local_dir_use_symlinks=False,
    force_download=True,
    resume_download=False,
    max_workers=1
)