# base model for the product - used to define the structure of the product data and to validate the data when creating or updating a product
from pydantic import (
    BaseModel,
    Field,
    AnyUrl,
    field_validator,
    model_validator,
    computed_field,
    EmailStr,
)

# typing imports - used to define the types of the fields in the model
# annoteded is used to define the type of the field and also to add additional metadata to the field, such as description, examples, etc.
from typing import Annotated, Literal, List, Optional
from uuid import UUID
from datetime import datetime


# create pydantic
class Seller(BaseModel):
    seller_id: UUID
    name: Annotated[
        str,
        Field(
            min_length=3,
            max_length=50,
            description="The name of the seller",
            examples=["Apple Store", "Samsung Electronics"],
        ),
    ]
    email: Annotated[EmailStr, Field(description="The email of the seller")]
    website: Annotated[AnyUrl, Field(description="The website of the seller")]

    @field_validator("email", mode="after")
    @classmethod
    def validate_seller_email(cls, value: EmailStr):
        allowed_domains = ["example.com", "store.com", "electronics.com"]
        domain = value.split("@")[-1]
        if domain not in allowed_domains:
            raise ValueError(f"Cureent domain {domain} is not allowed for seller email")

        return value


class dimensions_cm(BaseModel):
    length: Annotated[
        float,
        Field(
            gt=0,
            description="The length of the product in centimeters, must be positive",
            examples=[10.5, 25.0],
            strict=True,
        ),
    ]
    width: Annotated[
        float,
        Field(
            gt=0,
            description="The width of the product in centimeters, must be positive",
            examples=[5.0, 15.0],
            strict=True,
        ),
    ]
    height: Annotated[
        float,
        Field(
            gt=0,
            description="The height of the product in centimeters, must be positive",
            examples=[2.0, 10.0],
            strict=True,
        ),
    ]


class Product(BaseModel):
    id: UUID
    sku: Annotated[
        str,
        Field(
            min_length=6,
            max_length=20,
            description="The SKU of the product, must be between 6 and 20 characters",
            examples=["XIAO-359GB-0100", "REAL-135GB-1201"],
        ),
    ]
    name: Annotated[
        str,
        Field(
            min_length=3,
            max_length=50,
            description="The name of the product",
            examples=["Xiaomi 11T Pro", "Realme GT Neo 3"],
        ),
    ]
    description: Annotated[
        str, Field(max_length=200, description="The description of the product")
    ]
    category: Annotated[
        str,
        Field(
            min_length=3,
            max_length=30,
            description="The category of the product",
            examples=["Smartphone", "Laptop", "Headphones"],
        ),
    ]
    brand: Annotated[
        str,
        Field(
            min_length=2,
            max_length=30,
            description="The brand of the product",
            examples=["Xiaomi", "Realme", "Apple"],
        ),
    ]
    price: Annotated[
        float,
        Field(
            gt=0,
            description="The price of the product, must be positive",
            examples=[299.99, 499.99],
        ),
    ]
    currency: Literal["INR"] = "INR"
    discount_percentage: Annotated[
        int,
        Field(
            ge=0,
            le=90,
            description="The discount percentage for the product, must be between 0 and 90",
        ),
    ]
    stock: Annotated[
        int,
        Field(
            ge=0,
            description="The stock quantity of the product, must be non-negative",
            examples=[0, 10, 50],
        ),
    ]
    is_active: Annotated[
        bool,
        Field(
            description="Indicates whether the product is active or not",
            examples=[True, False],
        ),
    ]
    rating: Annotated[
        float,
        Field(
            ge=0, le=5, description="The rating of the product, must be between 0 and 5"
        ),
    ]
    Tags: Annotated[
        Optional[List[str]],
        Field(
            default=None,
            max_length=10,
            description="The tags associated with the product",
        ),
    ]
    image_urls: Annotated[
        list[AnyUrl],
        Field(max_length=1, description="The image URLs for the product"),
    ]
    dimensions_cm: dimensions_cm
    seller: Seller
    created_at: datetime

    ## using pydantic validators to validate the fields -
    # field validators are used to validate the fields of the model, they are defined as class methods and decorated with @validator
    # model validators are used to validate the entire model, they are defined as class methods and decorated with @root_validator
    # class methods are used to define methods that can be called on the model, they are defined as class methods and decorated with @classmethod
    # computed_validators are used to define computed fields, they are defined as class methods and decorated with @computed_field

    @field_validator("sku", mode="after")
    @classmethod
    def validdate_sku_format(cls, value: str):
        if "-" not in value:
            raise ValueError("SKU must contain at least one hyphen")

        last = value.split("-")[-1]
        if not (len(last) == 3 and last.isdigit()):
            raise ValueError("SKU must end with a 3 digit number")

        return value

    @model_validator(mode="after")
    @classmethod
    def validate_stock_and_isactive(cls, model: "Product"):
        if model.stock == 0 and model.is_active is True:
            raise ValueError("Product cannot be active if stock is 0")

        return model

    @computed_field
    @property
    def final_price(self) -> float:
        discount_amount = self.price * (self.discount_percentage / 100)
        return round(self.price - discount_amount, 2)

    @computed_field
    @property
    def product_volume(self) -> float:
        return round(
            self.dimensions_cm.length
            * self.dimensions_cm.width
            * self.dimensions_cm.height,
            2,
        )


# Update Pydantic
class Seller_Update(BaseModel):
    name: Optional[str] = Field(min_length=2, max_length=50)
    email: Optional[EmailStr]
    website: Optional[AnyUrl]

    @field_validator("email", mode="after")
    @classmethod
    def validate_seller_email(cls, value: EmailStr):
        allowed_domains = ["example.com", "store.com", "electronics.com"]
        domain = value.split("@")[-1]
        if domain not in allowed_domains:
            raise ValueError(f"Cureent domain {domain} is not allowed for seller email")

        return value


class dimensionsCM_Update(BaseModel):
    length: Optional[float] = Field(gt=0)
    width: Optional[float] = Field(gt=0)
    height: Optional[float] = Field(gt=0)


class Product_Update(BaseModel):
    name: Optional[str] = Field(min_length=3, max_length=100)
    description: Optional[str] = Field(max_length=200)
    category: Optional[str]
    brand: Optional[str]
    price: Optional[float] = Field(gt=0)
    currency: Optional[Literal["INR"]]
    discount_percentage: Optional[int] = Field(ge=0, le=90)
    stock: Optional[int] = Field(ge=0)
    is_active: Optional[bool] = Field(default=True)
    rating: Optional[float] = Field(ge=0, le=5)
    Tags: Optional[List[str]] = Field(max_length=10)
    image_urls: Optional[list[AnyUrl]]

    dimensions_cm: Optional[dimensionsCM_Update]
    seller: Optional[Seller_Update]
    created_at: datetime

    ## using pydantic validators to validate the fields -
    # field validators are used to validate the fields of the model, they are defined as class methods and decorated with @validator
    # model validators are used to validate the entire model, they are defined as class methods and decorated with @root_validator
    # class methods are used to define methods that can be called on the model, they are defined as class methods and decorated with @classmethod
    # computed_validators are used to define computed fields, they are defined as class methods and decorated with @computed_field

    @model_validator(mode="after")
    @classmethod
    def validate_stock_and_isactive(cls, model: "Product"):
        if model.stock == 0 and model.is_active is True:
            raise ValueError("Product cannot be active if stock is 0")

        return model

    @computed_field
    @property
    def final_price(self) -> float:
        discount_amount = self.price * (self.discount_percentage / 100)
        return round(self.price - discount_amount, 2)

    @computed_field
    @property
    def product_volume(self) -> float:
        return round(
            self.dimensions_cm.length
            * self.dimensions_cm.width
            * self.dimensions_cm.height,
            2,
        )
