---
name: machine-learning-pipelines
description: "End-to-end ML: data preprocessing, features, training, evaluation, and production deployment."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Machine Learning Pipelines

> End-to-end ML: data preprocessing, features, training, evaluation, and production deployment.

## Core Concepts

### Data Pipeline
Collection, cleaning, validation.

```python
import pandas as pd
from sklearn.preprocessing import StandardScaler

# Load and clean
df = pd.read_csv('raw_data.csv')
df.dropna(inplace=True)
df['age'].fillna(df['age'].median(), inplace=True)

# Validate
assert df['age'].min() >= 0
assert df['age'].max() <= 150
```

### Feature Engineering
Transform raw data into useful features.

```python
from sklearn.preprocessing import PolynomialFeatures

df['age_squared'] = df['age'] ** 2
df['income_per_age'] = df['income'] / (df['age'] + 1)

# Polynomial features
poly = PolynomialFeatures(degree=2)
X_poly = poly.fit_transform(X[['age', 'income']])
```

### Model Training
Cross-validation and hyperparameter tuning.

```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 20, 30]
}

grid_search = GridSearchCV(
    RandomForestClassifier(),
    param_grid,
    cv=5,
    scoring='accuracy'
)
grid_search.fit(X_train, y_train)
```

### Model Evaluation
Metrics, confusion matrix, ROC curves.

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    confusion_matrix, roc_auc_score
)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)

cm = confusion_matrix(y_test, y_pred)
auc = roc_auc_score(y_test, y_pred_proba)
```

## Best Practices

1. **Train/Test Split**: Proper data separation
2. **Cross-Validation**: Robust model evaluation
3. **Feature Scaling**: Normalize for algorithms that require it
4. **Imbalanced Data**: Handle class imbalance
5. **Reproducibility**: Set random seeds

## Related Skills

- MLOps Best Practices
- Performance Profiling & Analysis
- Caching Strategies & Hierarchies

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1234 | **Remixes**: 445
