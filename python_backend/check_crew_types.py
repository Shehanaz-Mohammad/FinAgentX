import crewai
import crewai_tools

print("CrewAI version:", getattr(crewai, "__version__", "unknown"))
print("CrewAI exports:", dir(crewai))
print("CrewAI Tools exports:", dir(crewai_tools))

# Check for Tool classes
try:
    from crewai import Tool
    print("Found crewai.Tool")
except ImportError:
    print("No crewai.Tool")

try:
    from crewai_tools import BaseTool
    print("Found crewai_tools.BaseTool")
except ImportError:
    print("No crewai_tools.BaseTool")
