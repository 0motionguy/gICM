# MLOps Best Practices

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Production ML lifecycle management: training, deployment, monitoring, and continuous improvement.

## Core MLOps Principles

### 1. Experiment Tracking with MLflow
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier

# Set experiment
mlflow.set_experiment("token-price-prediction")

with mlflow.start_run(run_name="random-forest-v1"):
    # Log parameters
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)
    mlflow.log_param("min_samples_split", 5)

    # Train model
    model = RandomForestClassifier(n_estimators=100, max_depth=10)
    model.fit(X_train, y_train)

    # Log metrics
    accuracy = model.score(X_test, y_test)
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("precision", precision_score(y_test, predictions))
    mlflow.log_metric("recall", recall_score(y_test, predictions))

    # Log model
    mlflow.sklearn.log_model(model, "model")

    # Log outputs
    mlflow.log_artifact("feature_importance.png")
    mlflow.log_artifact("confusion_matrix.png")
```

### 2. Data Versioning with DVC
```bash
# Initialize DVC
dvc init

# Track data files
dvc add data/raw/token_prices.csv
dvc add data/processed/features.parquet

# Commit DVC files to git
git add data/.gitignore data/raw/token_prices.csv.dvc
git commit -m "Track dataset v1"

# Configure remote storage (S3)
dvc remote add -d storage s3://ml-datasets/token-prediction
dvc push

# Pull specific version
git checkout v1.0
dvc pull
```

### 3. Feature Store (Feast)
```python
from feast import FeatureStore
from datetime import datetime

# Initialize feature store
store = FeatureStore(repo_path=".")

# Get features for training
training_df = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "token_features:price_24h_change",
        "token_features:volume_24h",
        "token_features:holder_count",
        "token_features:liquidity_usd"
    ],
).to_df()

# Get online features for inference
features = store.get_online_features(
    features=[
        "token_features:price_24h_change",
        "token_features:volume_24h"
    ],
    entity_rows=[{"token_id": "SOL"}]
).to_dict()
```

### 4. Model Registry
```python
import mlflow

# Register model
mlflow.register_model(
    model_uri="runs:/abc123/model",
    name="token-price-predictor"
)

# Transition to staging
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name="token-price-predictor",
    version=3,
    stage="Staging"
)

# Transition to production after validation
client.transition_model_version_stage(
    name="token-price-predictor",
    version=3,
    stage="Production"
)

# Load production model
model = mlflow.pyfunc.load_model(
    model_uri="models:/token-price-predictor/Production"
)
```

### 5. CI/CD for ML (GitHub Actions)
```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  train-and-evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run data validation
        run: python scripts/validate_data.py

      - name: Train model
        run: python train.py
        env:
          MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_URI }}

      - name: Evaluate model
        run: python evaluate.py

      - name: Register model
        if: github.ref == 'refs/heads/main'
        run: python scripts/register_model.py

      - name: Deploy to staging
        if: github.ref == 'refs/heads/main'
        run: python scripts/deploy_staging.py
```

### 6. Model Serving (FastAPI + Docker)
```python
from fastapi import FastAPI
import mlflow.pyfunc
import pandas as pd

app = FastAPI()

# Load model once at startup
model = mlflow.pyfunc.load_model("models:/token-price-predictor/Production")

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict")
async def predict(features: dict):
    # Convert to DataFrame
    df = pd.DataFrame([features])

    # Make prediction
    prediction = model.predict(df)

    return {
        "prediction": prediction[0],
        "model_version": model.metadata.run_id
    }

# Dockerfile
"""
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
"""
```

### 7. Model Monitoring
```python
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
prediction_counter = Counter(
    'model_predictions_total',
    'Total number of predictions'
)

prediction_latency = Histogram(
    'model_prediction_latency_seconds',
    'Prediction latency in seconds'
)

model_accuracy = Gauge(
    'model_accuracy',
    'Current model accuracy'
)

# Monitor predictions
@prediction_latency.time()
def predict(features):
    prediction = model.predict(features)
    prediction_counter.inc()
    return prediction

# Monitor data drift
from evidently.pipeline.column_mapping import ColumnMapping
from evidently.dashboard import Dashboard
from evidently.tabs import DataDriftTab

# Create drift report
drift_dashboard = Dashboard(tabs=[DataDriftTab()])
drift_dashboard.calculate(
    reference_data=train_data,
    current_data=production_data
)

# Alert if drift detected
if drift_dashboard.get_metric("dataset_drift")["drift_detected"]:
    send_alert("Data drift detected - retrain needed")
```

### 8. A/B Testing
```python
from sklearn.model_selection import train_test_split

class ABTestManager:
    def __init__(self):
        self.model_a = mlflow.pyfunc.load_model("models:/model-a/Production")
        self.model_b = mlflow.pyfunc.load_model("models:/model-b/Production")
        self.split_ratio = 0.5  # 50/50 split

    def predict(self, user_id: str, features: pd.DataFrame):
        # Assign user to variant
        variant = 'A' if hash(user_id) % 2 == 0 else 'B'

        # Make prediction
        if variant == 'A':
            prediction = self.model_a.predict(features)
        else:
            prediction = self.model_b.predict(features)

        # Log for analysis
        self.log_prediction(user_id, variant, prediction)

        return prediction

    def analyze_results(self):
        # Statistical significance test
        results_a = self.get_results('A')
        results_b = self.get_results('B')

        # T-test
        from scipy import stats
        t_stat, p_value = stats.ttest_ind(results_a, results_b)

        if p_value < 0.05:
            winner = 'A' if results_a.mean() > results_b.mean() else 'B'
            print(f"Winner: Model {winner}")
```

### 9. Automated Retraining Pipeline
```python
import schedule
import time
from datetime import datetime, timedelta

def retrain_pipeline():
    # 1. Fetch new data
    new_data = fetch_production_data(
        start_date=datetime.now() - timedelta(days=7)
    )

    # 2. Validate data quality
    if not validate_data(new_data):
        send_alert("Data quality issues detected")
        return

    # 3. Check if retraining is needed
    drift_score = calculate_drift(new_data)
    if drift_score < 0.1:  # No significant drift
        return

    # 4. Retrain model
    with mlflow.start_run(run_name=f"retrain-{datetime.now()}"):
        new_model = train_model(new_data)

        # 5. Evaluate on holdout set
        metrics = evaluate_model(new_model, holdout_data)

        # 6. Compare with production model
        prod_model = load_production_model()
        prod_metrics = evaluate_model(prod_model, holdout_data)

        # 7. Deploy if better
        if metrics['accuracy'] > prod_metrics['accuracy'] + 0.02:  # 2% improvement threshold
            mlflow.register_model(new_model, "token-price-predictor")
            deploy_to_production(new_model)
            send_alert(f"New model deployed: {metrics}")

# Schedule weekly retraining
schedule.every().monday.at("02:00").do(retrain_pipeline)

while True:
    schedule.run_pending()
    time.sleep(3600)
```

### 10. Model Explainability (SHAP)
```python
import shap
import matplotlib.pyplot as plt

# Load model and data
model = mlflow.sklearn.load_model("models:/token-price-predictor/Production")
X_test = pd.read_parquet("data/test_features.parquet")

# Create explainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Global feature importance
shap.summary_plot(shap_values, X_test, show=False)
plt.savefig("feature_importance.png")
mlflow.log_artifact("feature_importance.png")

# Individual prediction explanation
def explain_prediction(features):
    shap_values = explainer.shap_values(features)

    return {
        "prediction": model.predict(features)[0],
        "explanation": {
            feature: float(value)
            for feature, value in zip(features.columns, shap_values[0])
        }
    }
```

## Best Practices

- ✅ **Version everything**: Code, data, models, configurations
- ✅ **Automate training pipelines** with CI/CD
- ✅ **Monitor models in production** (accuracy, latency, drift)
- ✅ **Use feature stores** for consistency
- ✅ **Implement A/B testing** for new models
- ✅ **Track experiments** systematically
- ✅ **Explain model predictions** (especially for high-stakes decisions)
- ❌ Don't deploy without monitoring
- ❌ Avoid manual model updates
- ❌ Never skip data validation

## MLOps Maturity Checklist

- [ ] Experiment tracking (MLflow/Weights & Biases)
- [ ] Data versioning (DVC/LakeFS)
- [ ] Feature store (Feast/Tecton)
- [ ] Model registry
- [ ] Automated training pipeline
- [ ] CI/CD for ML
- [ ] Model serving infrastructure
- [ ] Production monitoring
- [ ] Data drift detection
- [ ] Automated retraining
- [ ] A/B testing framework
- [ ] Model explainability

---

**Category:** MLOps & Production ML
**Difficulty:** Advanced
**Prerequisites:** Machine learning, DevOps, Python, Docker
