"""MCP integration for the Kravos Platform."""

from rlm import McpIntegration


class KravosPlatform(McpIntegration):
    """Connect to the Kravos Platform MCP endpoint."""

    server = "kravos-platform"
    url = "https://mcp.kravos.ai/api/v1"
    bearer_token_env = "KRAVOS_API_KEY"


kravos_platform = KravosPlatform()

# Do not forward names probed by the kernel bootstrap; forwarding ``run`` would
# make this module look like a callable skill instead of an MCP integration.
_RESERVED = {"run", "__wrapped__", "__call__"}


def __getattr__(name: str):
    if name.startswith("_") or name in _RESERVED:
        raise AttributeError(name)
    return getattr(kravos_platform, name)
