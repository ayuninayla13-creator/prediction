import pandas as pd
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
import joblib

# Baca dataset
df = pd.read_csv("ndvi_training_data.csv")

# Hapus baris yang ada NaN
df = df.dropna()

# Pisahkan fitur dan label
X = df.drop(columns=["label"])
y = df["label"]

# Split train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Latih MLP
mlp = MLPClassifier(hidden_layer_sizes=(100,), max_iter=500, random_state=42)
mlp.fit(X_train, y_train)

# Simpan model
joblib.dump(mlp, "mlp_model.pkl")
print("Model disimpan ke mlp_model.pkl")
