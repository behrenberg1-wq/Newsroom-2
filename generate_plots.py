#!/usr/bin/env python3
"""
Generate three plots similar to the ones you provided:
 - engagement_vs_sentiment.png
 - sentiment_by_verification.png
 - distribution_sentiment.png

Usage:
  pip install numpy pandas matplotlib seaborn
  python3 generate_plots.py
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

sns.set(style="whitegrid", context="notebook", rc={"figure.dpi": 100})
np.random.seed(42)

# Create synthetic dataset
n = 300
# Verified flag: about 30% verified
verified = np.random.choice([True, False], size=n, p=[0.3, 0.7])

# Sentiment distributions:
# Verified skews positive, unverified is broader and includes more negative values
sentiment = np.zeros(n)
sentiment[verified] = np.clip(np.random.normal(loc=0.55, scale=0.25, size=verified.sum()), -1, 1)
sentiment[~verified] = np.clip(np.random.normal(loc=0.05, scale=0.45, size=(~verified).sum()), -1, 1)

# Engagement loosely correlates with emotional intensity (abs(sentiment)), with noise
base_engagement = np.random.poisson(lam=1200, size=n)  # baseline
engagement = (base_engagement + (np.abs(sentiment) * 4000).astype(int)
              + np.random.randint(-400, 400, size=n))

# Add a few extreme outliers to mimic very-high engagement posts
outlier_idx = np.random.choice(np.arange(n), size=3, replace=False)
engagement[outlier_idx] = np.array([520000, 310000, 560000])  # some extreme spikes
# Ensure non-negative
engagement = np.clip(engagement, 0, None)

df = pd.DataFrame({
    "sentiment": sentiment,
    "engagement": engagement,
    "verified": np.where(verified, "Verified", "Unverified")
})

# 1) Scatter: Engagement vs Sentiment Intensity
plt.figure(figsize=(11,6))
sizes = 40 + (df["engagement"] / df["engagement"].max()) * 140  # scale sizes
sc = plt.scatter(df["sentiment"], df["engagement"], c=df["sentiment"],
                 cmap="RdYlGn", vmin=-1, vmax=1, s=sizes, edgecolor="k", linewidth=0.3, alpha=0.85)
plt.colorbar(sc, label="Sentiment")
plt.title("Engagement vs Sentiment Intensity", fontsize=18, fontweight="bold")
plt.xlabel("Sentiment Intensity", fontsize=14)
plt.ylabel("Total Engagement", fontsize=14)
plt.suptitle("Source: Twitter Data", y=0.02, fontsize=10, style="italic")
plt.xlim(-1.05, 1.05)
plt.ylim(0, max(df["engagement"].max() * 1.05, 600000))
plt.tight_layout(rect=[0,0.03,1,0.95])
plt.savefig("engagement_vs_sentiment.png", dpi=200)
plt.close()

# 2) Overlaid histograms: Sentiment Distribution by Verification Status
plt.figure(figsize=(10,7))
bins = np.linspace(-1.0, 1.0, 30)
sns.histplot(df[df["verified"]=="Verified"]["sentiment"], bins=bins, color="#5DA5D5",
             label="Verified", kde=False, alpha=0.75)
sns.histplot(df[df["verified"]=="Unverified"]["sentiment"], bins=bins, color="#FFA94D",
             label="Unverified", kde=False, alpha=0.6)
plt.title("Sentiment Distribution by Verification Status", fontsize=18, fontweight="bold")
plt.xlabel("Sentiment Intensity", fontsize=14)
plt.ylabel("Frequency", fontsize=14)
plt.legend()
plt.suptitle("Source: Twitter Data", y=0.02, fontsize=10, style="italic")
plt.xlim(-1.05, 1.05)
plt.tight_layout(rect=[0,0.03,1,0.95])
plt.savefig("sentiment_by_verification.png", dpi=200)
plt.close()

# 3) Distribution of Sentiment Intensity: histogram + KDE, mean line
plt.figure(figsize=(11,6))
sns.histplot(df["sentiment"], bins=25, color="#7FAFD1", stat="density", edgecolor="k", alpha=0.7)
sns.kdeplot(df["sentiment"], color="#8B0000", linewidth=2.2)
mean_val = df["sentiment"].mean()
plt.axvline(mean_val, color="red", linestyle="--", linewidth=2, label=f"Mean: {mean_val:.3f}")
plt.title("Distribution of Sentiment Intensity", fontsize=18, fontweight="bold")
plt.xlabel("Sentiment Intensity Score", fontsize=14)
plt.ylabel("Density", fontsize=14)
plt.legend()
plt.suptitle("Source: Twitter Data", y=0.02, fontsize=10, style="italic")
plt.xlim(-2.0, 2.0)
plt.tight_layout(rect=[0,0.03,1,0.95])
plt.savefig("distribution_sentiment.png", dpi=200)
plt.close()

print("Done — generated files:")
print(" - engagement_vs_sentiment.png")
print(" - sentiment_by_verification.png")
print(" - distribution_sentiment.png")
