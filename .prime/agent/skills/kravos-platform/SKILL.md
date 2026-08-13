---
name: kravos-platform
description: Access the Kravos Platform through its MCP server. Use when the user asks to query or manage Kravos Platform resources.
---

# Kravos Platform

This MCP integration is exposed as a Python module in the kernel. Its tools are
defined by the server, so discover them before calling.

## Usage

```python
import kravos_platform

for tool in await kravos_platform.list_tools():
    print(tool["name"], "-", tool["description"])

result = await kravos_platform.call_tool("tool-name", {"argument": "value"})
```

After `list_tools()`, valid Python tool names are also available as async module
methods: `await kravos_platform.<tool_name>(...)`.

## Authentication

Run `/mcp login kravos-platform` and complete the Kravos.ai consent flow. The
integration requests the least-privilege `read` scope; Prime Agent stores and
refreshes the resulting OAuth tokens outside this repository.
