# Python Developer

> **ID:** `python-developer`
> **Tier:** 3
> **Token Cost:** 7000
> **MCP Connections:** postgres

## What This Skill Does

- Write clean Pythonic code
- Build APIs with FastAPI/Flask
- Handle async with asyncio
- Data processing with pandas/polars
- Type hints and mypy validation
- Testing with pytest
- Package management with uv/poetry

## When to Use

This skill is automatically loaded when:

- **Keywords:** python, fastapi, flask, pandas, asyncio, pip, poetry, uv
- **File Types:** .py
- **Directories:** src/, app/, tests/

---

## Core Capabilities

### 1. Modern Python Project Setup

**Project Structure:**
```
my-project/
├── pyproject.toml           # Project configuration
├── uv.lock                   # Lock file (if using uv)
├── src/
│   └── myproject/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── user_service.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── routes.py
│       │   └── deps.py
│       └── utils/
│           ├── __init__.py
│           └── helpers.py
├── tests/
│   ├── conftest.py
│   ├── test_models.py
│   └── test_services.py
└── scripts/
    └── seed_db.py
```

**pyproject.toml Configuration:**
```toml
[project]
name = "myproject"
version = "0.1.0"
description = "A modern Python project"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "sqlalchemy>=2.0.0",
    "alembic>=1.13.0",
    "asyncpg>=0.29.0",
    "httpx>=0.26.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "structlog>=24.1.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "pytest-cov>=4.1.0",
    "mypy>=1.8.0",
    "ruff>=0.1.0",
    "pre-commit>=3.6.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
target-version = "py311"
line-length = 88
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # Pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
]
ignore = ["E501"]  # Line too long - handled by formatter

[tool.ruff.isort]
known-first-party = ["myproject"]

[tool.mypy]
python_version = "3.11"
strict = true
plugins = ["pydantic.mypy"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-ra -q --cov=src --cov-report=term-missing"
```

**Package Management with uv:**
```bash
# Create virtual environment and install
uv venv
uv pip install -e ".[dev]"

# Add new dependency
uv pip install redis

# Sync with lock file
uv pip sync

# Run with uv
uv run python -m myproject.main
uv run pytest
```

---

### 2. FastAPI Application

**Complete FastAPI Setup:**
```python
# src/myproject/main.py
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from myproject.api.routes import router
from myproject.config import settings
from myproject.database import init_db, close_db
from myproject.middleware import RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom middleware
    app.add_middleware(RequestLoggingMiddleware)

    # Routes
    app.include_router(router, prefix="/api/v1")

    # Health check
    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "healthy"}

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("myproject.main:app", host="0.0.0.0", port=8000, reload=True)
```

**Configuration with Pydantic Settings:**
```python
# src/myproject/config.py
from functools import lru_cache
from typing import Literal

from pydantic import PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "MyProject"
    version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # API
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]

    # Database
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "myproject"

    @computed_field
    @property
    def database_url(self) -> str:
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_host,
                port=self.postgres_port,
                path=self.postgres_db,
            )
        )

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 30
    jwt_refresh_expiration_days: int = 7

    # Redis (optional)
    redis_url: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

**API Routes with Dependency Injection:**
```python
# src/myproject/api/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from myproject.api.deps import get_current_user, get_db
from myproject.models.user import User, UserCreate, UserResponse, UserUpdate
from myproject.services.user_service import UserService

router = APIRouter()


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> list[User]:
    service = UserService(db)
    return await service.get_all(skip=skip, limit=limit)


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> User:
    service = UserService(db)
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> User:
    service = UserService(db)
    return await service.create(user_data)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    service = UserService(db)
    user = await service.update(user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    service = UserService(db)
    if not await service.delete(user_id):
        raise HTTPException(status_code=404, detail="User not found")
```

**Dependencies:**
```python
# src/myproject/api/deps.py
from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from myproject.config import settings
from myproject.database import async_session
from myproject.models.user import User
from myproject.services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: int | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    service = UserService(db)
    user = await service.get_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user


# Type alias for cleaner dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
```

---

### 3. Async/Await Patterns

**Async Database Operations:**
```python
# src/myproject/database.py
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from myproject.config import settings

engine: AsyncEngine | None = None
async_session: async_sessionmaker[AsyncSession] | None = None


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    global engine, async_session

    engine = create_async_engine(
        settings.database_url,
        echo=settings.debug,
        pool_size=5,
        max_overflow=10,
    )

    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def close_db() -> None:
    global engine
    if engine:
        await engine.dispose()
```

**Concurrent Operations:**
```python
import asyncio
from typing import TypeVar
from collections.abc import Awaitable, Callable

T = TypeVar("T")


async def gather_with_limit(
    coroutines: list[Awaitable[T]],
    limit: int = 10,
) -> list[T]:
    """Run coroutines concurrently with a limit."""
    semaphore = asyncio.Semaphore(limit)

    async def limited_coro(coro: Awaitable[T]) -> T:
        async with semaphore:
            return await coro

    return await asyncio.gather(*(limited_coro(c) for c in coroutines))


async def retry_async(
    func: Callable[..., Awaitable[T]],
    *args,
    retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple[type[Exception], ...] = (Exception,),
    **kwargs,
) -> T:
    """Retry an async function with exponential backoff."""
    last_exception: Exception | None = None

    for attempt in range(retries):
        try:
            return await func(*args, **kwargs)
        except exceptions as e:
            last_exception = e
            if attempt < retries - 1:
                wait_time = delay * (backoff ** attempt)
                await asyncio.sleep(wait_time)

    raise last_exception  # type: ignore


async def timeout_wrapper(
    coro: Awaitable[T],
    timeout_seconds: float,
    default: T | None = None,
) -> T | None:
    """Wrap a coroutine with a timeout."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout_seconds)
    except asyncio.TimeoutError:
        return default


# Async context manager example
from contextlib import asynccontextmanager
from typing import AsyncGenerator

@asynccontextmanager
async def acquire_lock(
    redis: Redis,
    key: str,
    timeout: int = 30,
) -> AsyncGenerator[bool, None]:
    """Distributed lock using Redis."""
    lock_key = f"lock:{key}"
    acquired = await redis.set(lock_key, "1", nx=True, ex=timeout)

    try:
        yield acquired
    finally:
        if acquired:
            await redis.delete(lock_key)
```

---

### 4. Data Processing with Pandas/Polars

**Pandas Patterns:**
```python
import pandas as pd
from pathlib import Path
from typing import Any


def load_and_clean_data(filepath: Path) -> pd.DataFrame:
    """Load and clean data from CSV."""
    df = pd.read_csv(
        filepath,
        parse_dates=["created_at", "updated_at"],
        dtype={
            "id": "Int64",
            "status": "category",
            "amount": "float64",
        },
    )

    # Clean data
    df = (
        df
        .dropna(subset=["id"])
        .drop_duplicates(subset=["id"])
        .assign(
            amount=lambda x: x["amount"].clip(lower=0),
            status=lambda x: x["status"].str.lower(),
        )
    )

    return df


def aggregate_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate sales data by month and category."""
    return (
        df
        .assign(month=df["created_at"].dt.to_period("M"))
        .groupby(["month", "category"], observed=True)
        .agg(
            total_sales=("amount", "sum"),
            order_count=("id", "count"),
            avg_order_value=("amount", "mean"),
        )
        .reset_index()
        .sort_values(["month", "total_sales"], ascending=[True, False])
    )


def pivot_report(df: pd.DataFrame) -> pd.DataFrame:
    """Create pivot table for reporting."""
    return df.pivot_table(
        values="amount",
        index="category",
        columns=df["created_at"].dt.month_name(),
        aggfunc="sum",
        fill_value=0,
        margins=True,
        margins_name="Total",
    )
```

**Polars for Performance:**
```python
import polars as pl
from pathlib import Path


def process_large_file(filepath: Path) -> pl.DataFrame:
    """Process large files efficiently with Polars."""
    return (
        pl.scan_csv(filepath)  # Lazy evaluation
        .filter(pl.col("status") == "active")
        .with_columns([
            pl.col("amount").cast(pl.Float64),
            pl.col("created_at").str.to_datetime(),
        ])
        .group_by("category")
        .agg([
            pl.col("amount").sum().alias("total_amount"),
            pl.col("id").count().alias("count"),
            pl.col("amount").mean().alias("avg_amount"),
        ])
        .sort("total_amount", descending=True)
        .collect()  # Execute
    )


def join_datasets(
    orders: pl.LazyFrame,
    customers: pl.LazyFrame,
    products: pl.LazyFrame,
) -> pl.DataFrame:
    """Join multiple datasets efficiently."""
    return (
        orders
        .join(customers, on="customer_id", how="left")
        .join(products, on="product_id", how="left")
        .with_columns([
            (pl.col("quantity") * pl.col("unit_price")).alias("line_total"),
        ])
        .group_by("customer_id")
        .agg([
            pl.col("line_total").sum().alias("total_spend"),
            pl.col("order_id").n_unique().alias("order_count"),
        ])
        .collect()
    )
```

---

### 5. Type Hints and Mypy

**Advanced Type Patterns:**
```python
from typing import (
    TypeVar,
    Generic,
    Protocol,
    overload,
    Literal,
    TypedDict,
    NotRequired,
)
from collections.abc import Callable, Sequence


# Generic types
T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")


class Repository(Protocol[T]):
    """Protocol for repository pattern."""

    async def get(self, id: int) -> T | None: ...
    async def create(self, data: T) -> T: ...
    async def update(self, id: int, data: T) -> T | None: ...
    async def delete(self, id: int) -> bool: ...


class CacheService(Generic[K, V]):
    """Generic cache service."""

    def __init__(self) -> None:
        self._cache: dict[K, V] = {}

    def get(self, key: K) -> V | None:
        return self._cache.get(key)

    def set(self, key: K, value: V) -> None:
        self._cache[key] = value


# TypedDict for structured dictionaries
class UserDict(TypedDict):
    id: int
    email: str
    name: str
    is_active: NotRequired[bool]


class PaginatedResponse(TypedDict, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


# Overloads for different return types
@overload
def fetch_user(id: int, as_dict: Literal[True]) -> UserDict: ...
@overload
def fetch_user(id: int, as_dict: Literal[False] = False) -> User: ...
def fetch_user(id: int, as_dict: bool = False) -> User | UserDict:
    user = db.get_user(id)
    if as_dict:
        return {"id": user.id, "email": user.email, "name": user.name}
    return user


# Callable types
Handler = Callable[[Request], Response]
AsyncHandler = Callable[[Request], Awaitable[Response]]
Middleware = Callable[[Handler], Handler]


# ParamSpec for decorator typing
from typing import ParamSpec, Concatenate

P = ParamSpec("P")

def with_logging(
    func: Callable[Concatenate[str, P], T]
) -> Callable[Concatenate[str, P], T]:
    def wrapper(name: str, *args: P.args, **kwargs: P.kwargs) -> T:
        print(f"Calling {name}")
        return func(name, *args, **kwargs)
    return wrapper
```

**Pydantic Models with Validation:**
```python
from datetime import datetime
from typing import Annotated

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
    model_validator,
    ConfigDict,
)


class UserBase(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_default=True,
    )

    email: EmailStr
    name: Annotated[str, Field(min_length=2, max_length=100)]


class UserCreate(UserBase):
    password: Annotated[str, Field(min_length=8)]
    password_confirm: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain uppercase")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain digit")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserCreate":
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        return self


class UserResponse(UserBase):
    id: int
    is_active: bool = True
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    name: Annotated[str, Field(min_length=2, max_length=100)] | None = None
    is_active: bool | None = None
```

---

### 6. Testing with Pytest

**Test Configuration:**
```python
# tests/conftest.py
import asyncio
from collections.abc import AsyncGenerator
from typing import Generator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from myproject.database import Base
from myproject.main import app
from myproject.api.deps import get_db


# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create database session for each test."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with overridden dependencies."""

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def user_data() -> dict:
    """Sample user data for tests."""
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "SecurePass123",
        "password_confirm": "SecurePass123",
    }
```

**Test Examples:**
```python
# tests/test_users.py
import pytest
from httpx import AsyncClient

from myproject.models.user import User


class TestUserAPI:
    """User API tests."""

    @pytest.mark.asyncio
    async def test_create_user(self, client: AsyncClient, user_data: dict) -> None:
        response = await client.post("/api/v1/users", json=user_data)

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["name"] == user_data["name"]
        assert "password" not in data

    @pytest.mark.asyncio
    async def test_create_user_invalid_email(self, client: AsyncClient) -> None:
        response = await client.post(
            "/api/v1/users",
            json={"email": "invalid", "name": "Test", "password": "Pass123!"},
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_user(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
    ) -> None:
        # Create user directly in database
        user = User(email="test@example.com", name="Test", hashed_password="...")
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        response = await client.get(f"/api/v1/users/{user.id}")

        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_user_not_found(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/users/99999")

        assert response.status_code == 404


# tests/test_services.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from myproject.models.user import UserCreate
from myproject.services.user_service import UserService


class TestUserService:
    """User service unit tests."""

    @pytest.mark.asyncio
    async def test_create_user(self, db_session: AsyncSession) -> None:
        service = UserService(db_session)
        user_data = UserCreate(
            email="test@example.com",
            name="Test User",
            password="SecurePass123",
            password_confirm="SecurePass123",
        )

        user = await service.create(user_data)

        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.hashed_password != "SecurePass123"  # Should be hashed

    @pytest.mark.asyncio
    async def test_get_by_email(self, db_session: AsyncSession) -> None:
        service = UserService(db_session)

        # Create user first
        user_data = UserCreate(
            email="find@example.com",
            name="Find Me",
            password="SecurePass123",
            password_confirm="SecurePass123",
        )
        await service.create(user_data)

        # Find by email
        found = await service.get_by_email("find@example.com")

        assert found is not None
        assert found.name == "Find Me"

    @pytest.mark.asyncio
    async def test_get_by_email_not_found(self, db_session: AsyncSession) -> None:
        service = UserService(db_session)

        found = await service.get_by_email("notfound@example.com")

        assert found is None
```

**Mocking and Fixtures:**
```python
# tests/test_external.py
from unittest.mock import AsyncMock, patch

import pytest

from myproject.services.email_service import EmailService


class TestEmailService:
    @pytest.mark.asyncio
    async def test_send_email_success(self) -> None:
        with patch("myproject.services.email_service.httpx.AsyncClient") as mock:
            mock_client = AsyncMock()
            mock_client.post.return_value.status_code = 200
            mock.return_value.__aenter__.return_value = mock_client

            service = EmailService()
            result = await service.send_email(
                to="user@example.com",
                subject="Test",
                body="Hello!",
            )

            assert result is True
            mock_client.post.assert_called_once()

    @pytest.fixture
    def mock_redis(self) -> AsyncMock:
        """Mock Redis client."""
        mock = AsyncMock()
        mock.get.return_value = None
        mock.set.return_value = True
        return mock

    @pytest.mark.asyncio
    async def test_cached_fetch(self, mock_redis: AsyncMock) -> None:
        with patch("myproject.services.cache.redis_client", mock_redis):
            # Test cache miss
            mock_redis.get.return_value = None
            result = await fetch_with_cache("key")
            mock_redis.set.assert_called_once()

            # Test cache hit
            mock_redis.get.return_value = b'{"data": "cached"}'
            result = await fetch_with_cache("key")
            assert result == {"data": "cached"}
```

---

## Real-World Examples

### Example 1: Background Task Processing
```python
# services/task_processor.py
import asyncio
from dataclasses import dataclass
from typing import Callable, Awaitable
from collections.abc import Sequence

import structlog

logger = structlog.get_logger()


@dataclass
class Task:
    id: str
    func: Callable[..., Awaitable[None]]
    args: tuple = ()
    kwargs: dict = None
    retries: int = 3

    def __post_init__(self):
        if self.kwargs is None:
            self.kwargs = {}


class TaskProcessor:
    def __init__(self, max_workers: int = 10) -> None:
        self.max_workers = max_workers
        self._queue: asyncio.Queue[Task] = asyncio.Queue()
        self._workers: list[asyncio.Task] = []
        self._running = False

    async def start(self) -> None:
        """Start worker tasks."""
        self._running = True
        self._workers = [
            asyncio.create_task(self._worker(i))
            for i in range(self.max_workers)
        ]
        logger.info("Task processor started", workers=self.max_workers)

    async def stop(self) -> None:
        """Stop all workers gracefully."""
        self._running = False

        # Wait for queue to empty
        await self._queue.join()

        # Cancel workers
        for worker in self._workers:
            worker.cancel()

        await asyncio.gather(*self._workers, return_exceptions=True)
        logger.info("Task processor stopped")

    async def enqueue(self, task: Task) -> None:
        """Add task to queue."""
        await self._queue.put(task)
        logger.debug("Task enqueued", task_id=task.id)

    async def _worker(self, worker_id: int) -> None:
        """Worker coroutine."""
        while self._running:
            try:
                task = await asyncio.wait_for(
                    self._queue.get(),
                    timeout=1.0,
                )
            except asyncio.TimeoutError:
                continue

            try:
                await self._process_task(task)
            finally:
                self._queue.task_done()

    async def _process_task(self, task: Task) -> None:
        """Process a single task with retries."""
        for attempt in range(task.retries):
            try:
                await task.func(*task.args, **task.kwargs)
                logger.info("Task completed", task_id=task.id)
                return
            except Exception as e:
                logger.warning(
                    "Task failed",
                    task_id=task.id,
                    attempt=attempt + 1,
                    error=str(e),
                )
                if attempt < task.retries - 1:
                    await asyncio.sleep(2 ** attempt)

        logger.error("Task failed permanently", task_id=task.id)
```

### Example 2: CLI Application
```python
# cli.py
import asyncio
from typing import Annotated

import typer
from rich.console import Console
from rich.table import Table

from myproject.config import settings
from myproject.database import init_db
from myproject.services.user_service import UserService

app = typer.Typer(help="MyProject CLI")
console = Console()


@app.command()
def users_list(
    limit: Annotated[int, typer.Option("--limit", "-l")] = 10,
    active_only: Annotated[bool, typer.Option("--active")] = False,
) -> None:
    """List all users."""
    async def _list() -> None:
        await init_db()
        service = UserService()
        users = await service.get_all(limit=limit, active_only=active_only)

        table = Table(title="Users")
        table.add_column("ID", style="cyan")
        table.add_column("Email", style="green")
        table.add_column("Name")
        table.add_column("Active", style="yellow")

        for user in users:
            table.add_row(
                str(user.id),
                user.email,
                user.name,
                "Yes" if user.is_active else "No",
            )

        console.print(table)

    asyncio.run(_list())


@app.command()
def user_create(
    email: Annotated[str, typer.Argument()],
    name: Annotated[str, typer.Option("--name", "-n")],
    password: Annotated[str, typer.Option("--password", "-p", prompt=True, hide_input=True)],
) -> None:
    """Create a new user."""
    async def _create() -> None:
        await init_db()
        service = UserService()
        user = await service.create(
            UserCreate(email=email, name=name, password=password)
        )
        console.print(f"[green]Created user {user.id}[/green]")

    asyncio.run(_create())


if __name__ == "__main__":
    app()
```

---

## Related Skills

- `node-backend` - Node.js backend patterns
- `prisma-drizzle-orm` - ORM patterns (similar to SQLAlchemy)
- `container-chief` - Docker deployment
- `devops-engineer` - CI/CD pipelines

## Further Reading

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic V2 Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Python Type Hints Cheat Sheet](https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
