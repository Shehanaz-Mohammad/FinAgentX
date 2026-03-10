try:
    from langchain.tools import StructuredTool
    print("Found in langchain.tools")
except ImportError:
    print("Not in langchain.tools")

try:
    from langchain_core.tools import StructuredTool
    print("Found in langchain_core.tools")
except ImportError:
    print("Not in langchain_core.tools")
