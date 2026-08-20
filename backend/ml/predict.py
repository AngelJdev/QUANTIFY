import sys
import json
import joblib
import pandas as pd
from pathlib import Path

# Paths relative to this script
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "serialized"

def load_models():
    """Loads all serialized models and metadata."""
    try:
        rf_model = joblib.load(MODELS_DIR / "burnout_classifier.pkl")
        kmeans_model = joblib.load(MODELS_DIR / "kmeans_archetypes.pkl")
        with open(MODELS_DIR / "unsupervised_metadata.json", "r") as f:
            unsupervised_meta = json.load(f)
        with open(MODELS_DIR / "feature_config.json", "r") as f:
            feature_config = json.load(f)[0]
        return rf_model, kmeans_model, unsupervised_meta, feature_config
    except Exception as e:
        print(json.dumps({"error": f"Failed to load models: {str(e)}"}))
        sys.exit(1)

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: predict.py <type> <json_data>"}))
        sys.exit(1)

    predict_type = sys.argv[1] # 'burnout' or 'archetype' or 'full'
    raw_json = sys.argv[2]
    
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON string provided."}))
        sys.exit(1)

    rf_model, kmeans_model, unsupervised_meta, feature_config = load_models()
    
    # Create DataFrame from input data
    # Ensure correct column order
    try:
        df_all = pd.DataFrame([data], columns=feature_config["all_features"]).fillna(0)
        df_numeric = pd.DataFrame([data], columns=feature_config["numeric_features"]).fillna(0)
    except Exception as e:
        print(json.dumps({"error": f"Data mapping error: {str(e)}"}))
        sys.exit(1)

    result = {}

    if predict_type in ['burnout', 'full']:
        try:
            riesgo = rf_model.predict(df_all)[0]
            probas = rf_model.predict_proba(df_all)[0]
            max_confianza = float(max(probas))
            
            result["riesgo_abandono"] = str(riesgo)
            result["confianza_riesgo"] = max_confianza
        except Exception as e:
            result["error_burnout"] = str(e)

    if predict_type in ['archetype', 'full']:
        try:
            cluster_idx = kmeans_model.predict(df_numeric)[0]
            cluster_name = unsupervised_meta["cluster_names"].get(str(cluster_idx), "Desconocido")
            
            result["cluster_id"] = int(cluster_idx)
            result["arquetipo"] = str(cluster_name)
        except Exception as e:
            result["error_archetype"] = str(e)

    result["success"] = True
    print(json.dumps(result))

if __name__ == "__main__":
    # Ensure no other warnings print to stdout
    import warnings
    warnings.filterwarnings("ignore")
    main()
