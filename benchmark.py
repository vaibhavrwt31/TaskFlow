# ============================================
# TASKFLOW - ALGORITHM BENCHMARK
# ============================================

from backend.algorithms import (
    insertion_sort_count,
    binary_search_count,
    linear_search_count
)


# ============================================
# CREATE REALISTIC TASK-LIKE DATA
# ============================================

def generate_tasks(size):
    tasks = []

    priorities = ["low", "medium", "high"]

    for i in range(size):
        tasks.append({
            "title": f"Task {i:05d}",
            "priority": priorities[i % 3],
            "due_date": None
        })

    return tasks


# ============================================
# RUN BENCHMARK
# ============================================

def run_benchmark(size):
    print()
    print("=" * 50)
    print(f"DATA SIZE: {size} TASKS")
    print("=" * 50)

    # ----------------------------------------
    # INSERTION SORT
    # ----------------------------------------

    insertion_records = generate_tasks(size)

    # Reverse the records so insertion sort
    # has meaningful work to perform.
    insertion_records.reverse()

    insertion_comparisons = insertion_sort_count(
        insertion_records,
        "title"
    )

    print(
        f"Insertion Sort comparisons: "
        f"{insertion_comparisons}"
    )

    # ----------------------------------------
    # BINARY SEARCH
    # ----------------------------------------

    binary_records = generate_tasks(size)

    # Binary search requires sorted records.
    # They are already sorted by title.
    target = f"Task {size // 2:05d}"

    binary_result = binary_search_count(
        binary_records,
        target,
        "title"
    )

    print(
        f"Binary Search comparisons: "
        f"{binary_result['comparison_count']}"
    )

    print(
        f"Binary Search index: "
        f"{binary_result['index']}"
    )

    # ----------------------------------------
    # LINEAR SEARCH
    # ----------------------------------------

    linear_records = generate_tasks(size)

    linear_result = linear_search_count(
        linear_records,
        target,
        "title"
    )

    print(
        f"Linear Search comparisons: "
        f"{linear_result['comparison_count']}"
    )

    print(
        f"Linear Search index: "
        f"{linear_result['index']}"
    )


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":

    sizes = [10, 500, 3000]

    print()
    print("TASKFLOW ALGORITHM BENCHMARK")
    print("=" * 50)

    for size in sizes:
        run_benchmark(size)

    print()
    print("=" * 50)
    print("BENCHMARK COMPLETE")
    print("=" * 50)