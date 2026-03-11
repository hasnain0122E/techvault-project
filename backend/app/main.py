from dotenv import load_dotenv
import os
from fastapi import FastAPI, HTTPException, Query as Q, Path
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from service.products import (
    get_all_products,
    add_product,
    remove_product,
    change_product,
)
from schema.products import Product, Product_Update
from uuid import uuid4, UUID
from datetime import datetime

load_dotenv()

BASE_URL        = os.getenv("BASE_URL", "http://127.0.0.1:8000")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(
    title="TechVault API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# Without this the browser BLOCKS every request from React to FastAPI.
# This tells the browser "React on port 5173 is allowed to call this API".
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─────────────────────────────────────────────────────────────────────────────


@app.get("/", response_model=dict)
def read_root():
    return JSONResponse(
        status_code=200,
        content={"message": "Welcome to TechVault API!", "docs": f"{BASE_URL}/docs"},
    )


@app.get("/products", response_model=dict)
def list_products(
    name: str = Q(default=None, min_length=3, max_length=50),
    sort_by_price: bool = Q(default=False),
    order: str = Q(default="asc"),
    limit: int = Q(default=20, ge=1, le=100),
    page: int = Q(default=1, ge=1),
):
    products = get_all_products()

    if name:
        searched = name.strip().lower()
        products = [p for p in products if searched in p["name"].lower()]

    if not products:
        raise HTTPException(status_code=404, detail=f"No products found for name='{name}'")

    if sort_by_price:
        products = sorted(products, key=lambda p: p["price"], reverse=(order == "desc"))

    total = len(products)
    start = (page - 1) * limit
    products = products[start : start + limit]

    return JSONResponse(
        status_code=200,
        content={"total_products": total, "limit": limit, "page": page, "Items": products},
    )


@app.get("/products/{product_id}", response_model=dict)
def get_product(product_id: str = Path(..., min_length=36, max_length=36)):
    for product in get_all_products():
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")


@app.post("/products", status_code=201)
def create_product(product: Product):
    product_dict = product.model_dump(mode="json")
    product_dict["id"] = str(uuid4())
    product_dict["created_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        add_product(product_dict)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return JSONResponse(status_code=201, content=product_dict)


@app.delete("/products/{product_id}")
def delete_product(product_id: UUID = Path(...)):
    try:
        res = remove_product(str(product_id))
        return JSONResponse(status_code=200, content=res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.put("/products/{product_id}")
def update_product(
    product_id: UUID = Path(...),
    payload: Product_Update = ...,
):
    try:
        updated = change_product(
            str(product_id),
            payload.model_dump(mode="json", exclude_unset=True),
        )
        return JSONResponse(status_code=200, content=updated)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
