import json
from pathlib import Path
from typing import List, Dict

DATA_FILE = Path(__file__).parent.parent / "data" / "products.json"


def load_products() -> List[Dict]:
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def get_all_products() -> List[Dict]:
    return load_products()


def save_products(products: List[Dict]) -> None:
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)


def add_product(product: Dict) -> Dict:
    products = get_all_products()
    if any(p["sku"] == product["sku"] for p in products):
        raise ValueError(f"The product with {product['sku']} already exists")

    products.append(product)
    save_products(products)
    return product


def remove_product(id: str) -> str:
    products = get_all_products()
    for index, p in enumerate(products):
        if p["id"] == str(id):
            deleted = products.pop(index)
            save_products(products)
            return {"message": "Product successfully deleted", "data": deleted}


def change_product(product_id: str, updated_product: Dict) -> Dict:
    products = get_all_products()
    for index, p in enumerate(products):
        if p["id"] == str(product_id):
            for key, value in updated_product.items():
                if value is None:
                    continue
                if isinstance(value, dict) and isinstance(p.get(key), dict):
                    p[key].update(value)
                else:
                    p[key] = value
            products[index] = p
            save_products(products)
            return p
    raise ValueError(f"Product with id {product_id} not found")
