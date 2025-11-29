"""
AI Hedge Fund CLI
Command-line interface for multi-agent trading analysis
"""

import asyncio
from typing import Optional
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn

from .workflow import create_trading_graph, analyze_token
from .data import get_market_data
from .config import get_settings

app = typer.Typer(
    name="ai-hedge-fund",
    help="Multi-agent AI trading analysis powered by famous investor personas",
)
console = Console()


@app.command()
def analyze(
    token: str = typer.Argument(..., help="Token symbol or address to analyze"),
    chain: str = typer.Option("solana", "--chain", "-c", help="Blockchain"),
    mode: str = typer.Option(
        "full",
        "--mode",
        "-m",
        help="Analysis mode: full, fast, degen"
    ),
    provider: str = typer.Option(
        "anthropic",
        "--provider",
        "-p",
        help="LLM provider: anthropic, openai"
    ),
    show_reasoning: bool = typer.Option(
        True,
        "--reasoning/--no-reasoning",
        help="Show agent reasoning"
    ),
):
    """
    Run full multi-agent analysis on a token.

    Example:
        ai-hedge-fund analyze SOL
        ai-hedge-fund analyze BONK --mode degen
    """
    console.print(f"\n[bold blue]Analyzing {token}...[/bold blue]\n")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Running agents...", total=None)

        async def run():
            graph = create_trading_graph(
                provider=provider,
                mode=mode,
                show_reasoning=show_reasoning,
            )
            return await graph.analyze(token, chain)

        result = asyncio.run(run())
        progress.update(task, completed=True)

    if result.get("error"):
        console.print(f"[red]Error: {result['error']}[/red]")
        raise typer.Exit(1)

    # Display results
    _display_analysis(result, show_reasoning)


@app.command()
def quick(
    token: str = typer.Argument(..., help="Token symbol or address"),
    chain: str = typer.Option("solana", "--chain", "-c", help="Blockchain"),
):
    """
    Quick signal check with minimal analysis.

    Example:
        ai-hedge-fund quick BONK
    """
    console.print(f"\n[bold blue]Quick check: {token}[/bold blue]\n")

    async def run():
        graph = create_trading_graph(mode="fast", show_reasoning=False)
        return await graph.quick_signal(token, chain)

    result = asyncio.run(run())

    if result.get("error"):
        console.print(f"[red]Error: {result['error']}[/red]")
        raise typer.Exit(1)

    # Quick display
    sentiment_colors = {
        "very_bullish": "green",
        "bullish": "light_green",
        "neutral": "yellow",
        "bearish": "orange3",
        "very_bearish": "red",
    }

    color = sentiment_colors.get(result["sentiment"], "white")

    console.print(Panel(
        f"""
[bold]Token:[/bold] {result['token']}
[bold]Price:[/bold] ${result.get('price', 'N/A')}
[bold]24h:[/bold] {result.get('change_24h', 'N/A')}%

[bold]Sentiment:[/bold] [{color}]{result['sentiment']}[/{color}]
[bold]Confidence:[/bold] {result['confidence']:.0f}%

[bold]Quick Take:[/bold] {result['quick_take']}
        """,
        title="Quick Signal",
    ))


@app.command()
def market(
    token: str = typer.Argument(..., help="Token symbol or address"),
    chain: str = typer.Option("solana", "--chain", "-c", help="Blockchain"),
):
    """
    Fetch and display market data for a token.

    Example:
        ai-hedge-fund market SOL
    """
    console.print(f"\n[bold blue]Fetching market data for {token}...[/bold blue]\n")

    async def run():
        return await get_market_data(token, chain)

    data = asyncio.run(run())

    if not data.get("price"):
        console.print(f"[red]No market data found for {token}[/red]")
        raise typer.Exit(1)

    table = Table(title=f"Market Data: {token}")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="green")

    for key, value in data.items():
        if value is not None and value != "N/A":
            if isinstance(value, float):
                if value > 1000000:
                    formatted = f"${value:,.0f}"
                elif value > 1:
                    formatted = f"{value:.2f}"
                else:
                    formatted = f"{value:.6f}"
            else:
                formatted = str(value)
            table.add_row(key, formatted)

    console.print(table)


@app.command()
def serve(
    host: str = typer.Option("0.0.0.0", "--host", "-h", help="Host to bind"),
    port: int = typer.Option(8001, "--port", "-p", help="Port to bind"),
    reload: bool = typer.Option(False, "--reload", "-r", help="Enable auto-reload"),
):
    """
    Start the FastAPI server.

    Example:
        ai-hedge-fund serve --port 8001
    """
    import uvicorn

    console.print(f"\n[bold green]Starting AI Hedge Fund API...[/bold green]")
    console.print(f"[dim]http://{host}:{port}[/dim]\n")

    uvicorn.run(
        "src.api.app:app",
        host=host,
        port=port,
        reload=reload,
    )


@app.command()
def agents():
    """
    List all available agents.
    """
    from .agents import (
        BUFFETT_CONFIG, BURRY_CONFIG, MUNGER_CONFIG,
        WOOD_CONFIG, ACKMAN_CONFIG, DEGEN_CONFIG,
        SOLANA_CONFIG, WHALE_CONFIG, PUMP_TRADER_CONFIG,
        ONCHAIN_CONFIG, RISK_MANAGER_CONFIG, PORTFOLIO_MANAGER_CONFIG,
    )

    configs = [
        ("Persona", [BUFFETT_CONFIG, BURRY_CONFIG, MUNGER_CONFIG, WOOD_CONFIG, ACKMAN_CONFIG]),
        ("Crypto", [DEGEN_CONFIG, SOLANA_CONFIG, WHALE_CONFIG, PUMP_TRADER_CONFIG, ONCHAIN_CONFIG]),
        ("Management", [RISK_MANAGER_CONFIG, PORTFOLIO_MANAGER_CONFIG]),
    ]

    for category, agents in configs:
        console.print(f"\n[bold blue]{category} Agents[/bold blue]")

        table = Table()
        table.add_column("Name", style="cyan")
        table.add_column("Risk", style="yellow")
        table.add_column("Horizon", style="green")
        table.add_column("Description")

        for agent in agents:
            table.add_row(
                agent.name,
                agent.risk_tolerance,
                agent.time_horizon,
                agent.description[:50] + "..." if len(agent.description) > 50 else agent.description,
            )

        console.print(table)


def _display_analysis(result: dict, show_reasoning: bool):
    """Display full analysis results"""

    # Market data
    market_data = result.get("market_data", {})
    console.print(Panel(
        f"""
[bold]Token:[/bold] {result['token']} ({result['chain']})
[bold]Price:[/bold] ${market_data.get('price', 'N/A')}
[bold]Market Cap:[/bold] ${market_data.get('market_cap', 'N/A'):,.0f}
[bold]24h Change:[/bold] {market_data.get('change_24h', 'N/A')}%
[bold]Volume:[/bold] ${market_data.get('volume_24h', 'N/A'):,.0f}
        """,
        title="Market Data",
    ))

    # Agent signals
    console.print("\n[bold blue]Agent Signals[/bold blue]")

    table = Table()
    table.add_column("Agent", style="cyan")
    table.add_column("Action", style="bold")
    table.add_column("Confidence")
    table.add_column("Key Point")

    for signal in result.get("agent_signals", []):
        action_color = {
            "bullish": "green",
            "bearish": "red",
            "neutral": "yellow",
        }.get(signal["action"], "white")

        table.add_row(
            signal["agent"],
            f"[{action_color}]{signal['action']}[/{action_color}]",
            f"{signal['confidence']:.0f}%",
            signal["reasoning"][:60] + "..." if len(signal["reasoning"]) > 60 else signal["reasoning"],
        )

    console.print(table)

    # Risk assessment
    risk = result.get("risk_assessment")
    if risk:
        console.print(Panel(
            f"""
[bold]Assessment:[/bold] {risk['action']}
[bold]Confidence:[/bold] {risk['confidence']:.0f}%
[bold]Reasoning:[/bold] {risk['reasoning'][:200]}...
            """,
            title="Risk Manager",
        ))

    # Final decision
    decision = result.get("final_decision", {})
    action_color = {
        "buy": "green",
        "sell": "red",
        "hold": "yellow",
        "avoid": "red",
    }.get(decision.get("action", ""), "white")

    console.print(Panel(
        f"""
[bold]Action:[/bold] [{action_color}]{decision.get('action', 'N/A').upper()}[/{action_color}]
[bold]Conviction:[/bold] {decision.get('conviction', 'N/A')}
[bold]Confidence:[/bold] {decision.get('confidence', 'N/A')}%

[bold]Reasoning:[/bold]
{decision.get('reasoning', 'N/A')[:500]}
        """,
        title="[bold]Final Decision[/bold]",
        border_style=action_color,
    ))

    # Execution plan
    plan = decision.get("execution_plan")
    if plan:
        console.print(Panel(
            f"""
[bold]Order Type:[/bold] {plan.get('order_type', 'N/A')}
[bold]Entry:[/bold] {plan.get('entry_price', 'N/A')}
[bold]Size:[/bold] {plan.get('position_size_pct', 'N/A')}%
[bold]Stop Loss:[/bold] {plan.get('stop_loss', 'N/A')}
[bold]Take Profit:[/bold] {plan.get('take_profit', 'N/A')}
            """,
            title="Execution Plan",
        ))

    # Summary
    console.print(f"\n{result.get('summary', '')}")


if __name__ == "__main__":
    app()
