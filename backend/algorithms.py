
from datetime import date, timedelta
import re
# =========================
# TASKFLOW ALGORITHM ENGINE
# =========================

PRIORITY_SCORE = {
    "high": 3,
    "medium": 2,
    "low": 1
}

# =========================
# SMART DUE DATE DETECTION
# =========================

def detect_due_date(text):
    from datetime import date, timedelta
    import re

    text = text.lower().strip()
    today = date.today()

    # today
    if "today" in text:
        return today.isoformat()

    # tomorrow
    if "tomorrow" in text:
        return (today + timedelta(days=1)).isoformat()

    # Month names
    months = {
        "january": 1,
        "february": 2,
        "march": 3,
        "april": 4,
        "may": 5,
        "june": 6,
        "july": 7,
        "august": 8,
        "september": 9,
        "october": 10,
        "november": 11,
        "december": 12
    }

    # Example:
    # "Submit assignment on 15 August"
    # "Meeting on 20 August"
    match = re.search(
        r"\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|"
        r"september|october|november|december)\b",
        text
    )

    if match:
        day = int(match.group(1))
        month_name = match.group(2)
        month = months[month_name]

        year = today.year

        try:
            detected_date = date(year, month, day)

            # If the date has already passed this year,
            # assume the user means next year.
            if detected_date < today:
                detected_date = date(year + 1, month, day)

            return detected_date.isoformat()

        except ValueError:
            return None

    return None

def calculate_task_score(task):
    """
    Calculate a numerical priority score for a task.

    Higher score = higher priority.
    """

    return PRIORITY_SCORE.get(
        task.priority,
        1
    )


def prioritize_tasks(tasks):
    """
    Sort tasks from highest priority
    to lowest priority.
    """

    return sorted(
        tasks,
        key=calculate_task_score,
        reverse=True
    )
    
def calculate_urgency_score(task):
    """
    Calculate urgency based on task priority and due date.
    """

    score = calculate_task_score(task)

    if task.due_date:
        try:
            from datetime import date

            due_date = date.fromisoformat(task.due_date)
            today = date.today()

            days_left = (due_date - today).days

            # Overdue
            if days_left < 0:
                score += 5

            # Due today
            elif days_left == 0:
                score += 4

            # Due tomorrow
            elif days_left == 1:
                score += 3

            # Due within 3 days
            elif days_left <= 3:
                score += 2

            # Due within a week
            elif days_left <= 7:
                score += 1

        except ValueError:
            pass

    return score 


def prioritize_tasks_by_urgency(tasks):
    """
    Sort tasks according to urgency.
    Higher score = more urgent.
    """

    return sorted(
        tasks,
        key=calculate_urgency_score,
        reverse=True
    )
    

def get_recommended_task(tasks):
    """
    Return the most urgent task.
    """

    if not tasks:
        return None

    return max(
        tasks,
        key=calculate_urgency_score
    )
    
    
    
# =========================
# TASK ANALYTICS
# =========================

def calculate_task_statistics(tasks):
    """
    Calculate basic task completion statistics.
    """

    total_tasks = len(tasks)

    completed_tasks = sum(
        1 for task in tasks
        if task.status == "completed"
    )

    pending_tasks = total_tasks - completed_tasks

    completion_percentage = (
        (completed_tasks / total_tasks) * 100
        if total_tasks > 0
        else 0
    )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "completion_percentage": round(
            completion_percentage,
            2
        )
    }

# =========================
# SMART TASK FILTER
# =========================

def filter_tasks(
    tasks,
    keyword=None,
    priority=None,
    status=None
):
    """
    Filter tasks by keyword, priority and status.
    """

    filtered_tasks = tasks

    if keyword:
        keyword = keyword.lower()

        filtered_tasks = [
            task for task in filtered_tasks
            if keyword in task.title.lower()
        ]

    if priority:
        filtered_tasks = [
            task for task in filtered_tasks
            if task.priority == priority
        ]

    if status:
        filtered_tasks = [
            task for task in filtered_tasks
            if task.status == status
        ]

    return filtered_tasks

# =========================
# INSERTION SORT
# =========================

def insertion_sort(records, key):
    """
    Sort records in place using insertion sort.
    """

    for i in range(1, len(records)):
        current = records[i]
        j = i - 1

        while j >= 0 and records[j][key] > current[key]:
            records[j + 1] = records[j]
            j -= 1

        records[j + 1] = current


# =========================
# BINARY SEARCH
# =========================

def binary_search(sorted_records, target_value, key):
    """
    Search a sorted list using binary search.
    Returns index if found, otherwise -1.
    """

    low = 0
    high = len(sorted_records) - 1

    while low <= high:
        mid = (low + high) // 2

        if sorted_records[mid][key] == target_value:
            return mid

        elif sorted_records[mid][key] < target_value:
            low = mid + 1

        else:
            high = mid - 1

    return -1


# =========================
# LINEAR SEARCH
# =========================

def linear_search(records, target_value, key):
    """
    Search records sequentially.
    Returns first matching index, otherwise -1.
    """

    for i in range(len(records)):
        if records[i][key] == target_value:
            return i

    return -1

# =========================
# INSERTION SORT COUNT
# =========================

def insertion_sort_count(records, key):
    comparison_count = 0

    for i in range(1, len(records)):
        current = records[i]
        j = i - 1

        while j >= 0:
            comparison_count += 1

            if records[j][key] <= current[key]:
                break

            records[j + 1] = records[j]
            j -= 1

        records[j + 1] = current

    return comparison_count


# =========================
# BINARY SEARCH COUNT
# =========================

def binary_search_count(sorted_records, target_value, key):
    low = 0
    high = len(sorted_records) - 1
    comparison_count = 0

    while low <= high:
        mid = (low + high) // 2
        comparison_count += 1

        if sorted_records[mid][key] == target_value:
            return {
                "index": mid,
                "comparison_count": comparison_count
            }

        if sorted_records[mid][key] < target_value:
            low = mid + 1
        else:
            high = mid - 1

    return {
        "index": -1,
        "comparison_count": comparison_count
    }


# =========================
# LINEAR SEARCH COUNT
# =========================

def linear_search_count(records, target_value, key):
    comparison_count = 0

    for i in range(len(records)):
        comparison_count += 1

        if records[i][key] == target_value:
            return {
                "index": i,
                "comparison_count": comparison_count
            }

    return {
        "index": -1,
        "comparison_count": comparison_count
    }
    
# =========================
# AI QUICK-ADD TASK PARSER
# =========================

def parse_quick_task(description):
    """
    Parse a natural-language task description.

    Detects:
    - title
    - priority
    - due date

    Example:
        "Urgent submit assignment tomorrow"

    Returns:
        {
            "title": "submit assignment",
            "priority": "high",
            "due_date_hint": "YYYY-MM-DD"
        }
    """

    original = description.strip()
    text = original.lower()

    today = date.today()

    # =========================
    # PRIORITY DETECTION
    # =========================

    if "urgent" in text or "asap" in text:
        priority = "high"

    elif "whenever" in text or "low priority" in text:
        priority = "low"

    else:
        priority = "medium"

    # =========================
    # DUE DATE DETECTION
    # =========================

    due_date = None
    matched_date_phrase = None

    # TODAY
    if re.search(r"\btoday\b", text):
        due_date = today
        matched_date_phrase = "today"

    # TOMORROW
    elif re.search(r"\btomorrow\b", text):
        due_date = today + timedelta(days=1)
        matched_date_phrase = "tomorrow"

    # NEXT WEEK
    elif re.search(r"\bnext week\b", text):
        due_date = today + timedelta(days=7)
        matched_date_phrase = "next week"

    # NEXT WEEKDAY
    else:
        weekdays = {
            "monday": 0,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 3,
            "friday": 4,
            "saturday": 5,
            "sunday": 6
        }

        for weekday_name, weekday_number in weekdays.items():

            # Check "next monday"
            if re.search(
                r"\bnext\s+" + weekday_name + r"\b",
                text
            ):
                days_ahead = (
                    weekday_number - today.weekday()
                ) % 7

                if days_ahead == 0:
                    days_ahead = 7

                due_date = today + timedelta(
                    days=days_ahead
                )

                matched_date_phrase = (
                    "next " + weekday_name
                )

                break

            # Check plain "monday"
            elif re.search(
                r"\b" + weekday_name + r"\b",
                text
            ):
                days_ahead = (
                    weekday_number - today.weekday()
                ) % 7

                if days_ahead == 0:
                    days_ahead = 7

                due_date = today + timedelta(
                    days=days_ahead
                )

                matched_date_phrase = weekday_name

                break

    # =========================
    # MONTH + DAY
    # =========================

    if due_date is None:

        months = {
            "january": 1,
            "february": 2,
            "march": 3,
            "april": 4,
            "may": 5,
            "june": 6,
            "july": 7,
            "august": 8,
            "september": 9,
            "october": 10,
            "november": 11,
            "december": 12
        }

        month_pattern = (
            r"\b(\d{1,2})\s+("
            r"january|february|march|april|may|june|july|"
            r"august|september|october|november|december"
            r")\b"
        )

        match = re.search(
            month_pattern,
            text
        )

        if match:

            day = int(match.group(1))
            month_name = match.group(2)
            month = months[month_name]

            try:
                detected_date = date(
                    today.year,
                    month,
                    day
                )

                # If already passed, use next year
                if detected_date < today:
                    detected_date = date(
                        today.year + 1,
                        month,
                        day
                    )

                due_date = detected_date

                matched_date_phrase = match.group(0)

            except ValueError:
                pass

    # =========================
    # TITLE CLEANING
    # =========================

    title = original

    priority_keywords = [
        "urgent",
        "asap",
        "whenever",
        "low priority"
    ]

    for keyword in priority_keywords:
        title = re.sub(
            r"\b" + re.escape(keyword) + r"\b",
            "",
            title,
            flags=re.IGNORECASE
        )

    if matched_date_phrase:

        title = re.sub(
            r"\b" + re.escape(matched_date_phrase) + r"\b",
            "",
            title,
            flags=re.IGNORECASE
        )

    # Clean extra spaces
    title = re.sub(
        r"\s+",
        " ",
        title
    ).strip()

    if not title:
        title = "Untitled task"

    return {
        "title": title,
        "priority": priority,
        "due_date_hint": (
            due_date.isoformat()
            if due_date
            else None
        )
    }
