# Flood Vulnerability ML Pipeline

This directory contains the machine learning pipeline for predicting long-term flood-prone zones using terrain and hydrological indicators.

## Files

- **`flood_model_training.ipynb`** — Jupyter notebook for data exploration, model training, and evaluation
- **`flood_model.pkl`** — Trained RandomForestClassifier model (generated after running notebook)
- **`model_metadata.json`** — Model metadata and performance metrics (generated after running notebook)
- **`dataset.csv`** — Input dataset with features and `Flood_Prone` target variable (place your CSV here)

## Quick Start

### 1. Prepare Dataset

Place your CSV file as `ml/dataset.csv` with columns including:
- Feature columns (terrain, hydrology, elevation, etc.)
- Target column: `Flood_Prone` (0 = Not prone, 1 = Prone)

### 2. Run Notebook

```bash
jupyter notebook ml/flood_model_training.ipynb
```

### 3. Execute All Cells

The notebook will:
- ✓ Explore and visualize the dataset
- ✓ Handle missing values
- ✓ Train RandomForestClassifier (n_estimators=100)
- ✓ Evaluate with accuracy, precision, recall, F1-score
- ✓ Visualize feature importance
- ✓ Save model to `flood_model.pkl`
- ✓ Save metadata to `model_metadata.json`

## Model Architecture

- **Algorithm:** RandomForestClassifier
- **n_estimators:** 100
- **Train-Test Split:** 80-20 with stratification
- **Random State:** 42 (reproducibility)
- **Target Variable:** Binary classification (0/1)

## Expected Performance

After training, the notebook generates:
- **Confusion Matrix** visualization
- **Classification Report** (Precision, Recall, F1-Score, ROC-AUC)
- **Feature Importance** bar chart (top 15 features)

## Using the Trained Model

### Load Model in Python

```python
import joblib
import json

# Load model
model = joblib.load('ml/flood_model.pkl')

# Load metadata
with open('ml/model_metadata.json', 'r') as f:
    metadata = json.load(f)

# Make predictions
predictions = model.predict(X_new)
probabilities = model.predict_proba(X_new)
```

### Integration with React Dashboard

The trained model can be integrated with the RiverTwin AI React dashboard:

1. Save predictions to a .csv or JSON
2. Create an API endpoint (Flask/FastAPI)
3. Pass predictions to the Cesium map for visualization
4. Update risk metrics in real-time

## Requirements

Install dependencies before running:

```bash
pip install pandas numpy matplotlib seaborn scikit-learn joblib jupyter
```

## Notes

- **Data Assumption:** Dataset rows with missing values are dropped. Modify preprocessing as needed.
- **Categorical Features:** Automatically one-hot encoded during preprocessing.
- **Class Imbalance:** Stratified split preserves class distribution.
- **Reproducibility:** `random_state=42` ensures consistent results across runs.

## Next Steps

1. **Hyperparameter Tuning:** Use GridSearchCV to optimize `n_estimators`, `max_depth`, etc.
2. **Feature Engineering:** Create interaction features for improved predictions.
3. **Cross-Validation:** Implement k-fold CV for robust evaluation.
4. **Production Deployment:** Save model versioning metadata and use MLflow for tracking.
5. **Monitoring:** Track model performance on new data over time.

---

**Created for:** RiverTwin AI - Urban Flood Vulnerability Assessment
**Use Case:** Sustainable urban planning and disaster risk reduction
