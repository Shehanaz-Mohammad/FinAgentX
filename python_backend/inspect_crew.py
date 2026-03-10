try:
    import crewai
    print("CrewAI dir:", dir(crewai))
except ImportError as e:
    print("CrewAI verify fail:", e)

try:
    import crewai_tools
    print("CrewAI Tools dir:", dir(crewai_tools))
except ImportError as e:
    print("CrewAI Tools verify fail:", e)
