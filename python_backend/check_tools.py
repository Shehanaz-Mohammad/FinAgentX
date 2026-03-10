
try:
    import langchain.tools
    print("langchain.tools members:", dir(langchain.tools))
except ImportError:
    print("Could not import langchain.tools")

try:
    from langchain.tools import StructuredTool
    print("Successfully imported StructuredTool from langchain.tools")
except ImportError:
    print("Failed to import StructuredTool from langchain.tools")

try:
    import langchain_core.tools
    print("langchain_core.tools members:", dir(langchain_core.tools))
except ImportError:
    print("Could not import langchain_core.tools")
