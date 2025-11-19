from datasets import load_dataset

# Carrega o split "train" do wikitext-103-v1
ds = load_dataset("Salesforce/wikitext", "wikitext-103-v1", split="train")
# col 'text' é uma string com o conteúdo de cada linha/artigo :contentReference[oaicite:1]{index=1}

with open("wikitext103_train.txt", "w", encoding="utf-8") as f:
    for row in ds:
        text = row["text"].replace("\n", " ")
        f.write(text + "\n")
