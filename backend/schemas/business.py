from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DashboardStatsSchema(BaseModel):
    requests_today: int
    requests_pct: float
    requests_spark: List[float] = []
    active_deliveries: int
    active_pct: float
    active_spark: List[float] = []
    completed_today: int
    completed_pct: float
    completed_spark: List[float] = []
    total_earnings: float
    earnings_pct: float
    earnings_spark: List[float] = []
    wallet_balance: float
    offices_count: int

class StatusOverviewSchema(BaseModel):
    pending: int
    picked_up: int
    on_way: int
    delivered: int
    total: int
    success_rate: float
    on_time_rate: str
    total_deliveries: int

class EarningsOverviewSchema(BaseModel):
    period: str
    total_earnings: float
    pct_change: float
    delivery_fees: float
    tips: float
    bonuses: float
    other_income: float
    chart_data: List[Dict[str, Any]]
