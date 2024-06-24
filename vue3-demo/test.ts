import { watch, ref } from 'vue';

interface Column {
  element: HTMLDivElement;
  height: number;
}

function getColumnHeights(columns: HTMLCollectionOf<HTMLDivElement>): Column[] {
  const columnHeights: Column[] = [];
  for (const column of Array.from(columns)) {
    const height = column.scrollHeight;
    columnHeights.push({ element: column, height });
  }
  return columnHeights;
}

function getLastRowElements(columns: HTMLCollectionOf<HTMLDivElement>): HTMLDivElement[] {
  const lastRowElements: HTMLDivElement[] = [];
  for (const column of Array.from(columns)) {
    const children = column.children;
    if (children.length > 0) {
      const lastElement = children[children.length - 1] as HTMLDivElement;
      lastRowElements.push(lastElement);
    }
  }
  return lastRowElements;
}

function getMinHeightElement(elements: HTMLDivElement[]): HTMLDivElement | null {
  let minElement: HTMLDivElement | null = null;
  let minHeight = Infinity;

  for (const element of elements) {
    const height = element.scrollHeight;
    if (height < minHeight) {
      minHeight = height;
      minElement = element;
    }
  }
  return minElement;
}

function getMaxHeightDifference(columns: Column[]): number {
  const heights = columns.map(col => col.height);
  return Math.max(...heights) - Math.min(...heights);
}

function balanceColumns(columns: HTMLCollectionOf<HTMLDivElement>): void {
  let columnHeights = getColumnHeights(columns);
  let lastRowElements = getLastRowElements(columns);
  let minHeightElement = getMinHeightElement(lastRowElements);

  if (!minHeightElement) return;

  while (true) {
    // Find the shortest column
    columnHeights.sort((a, b) => a.height - b.height);
    const shortestColumn = columnHeights[0];

    // Calculate the maximum difference in column heights
    const maxHeightDiff = getMaxHeightDifference(columnHeights);

    // Check if the difference is less than the height of the smallest element in the last row
    if (maxHeightDiff < minHeightElement.scrollHeight) break;

    // Append the smallest element to the shortest column
    shortestColumn.element.appendChild(minHeightElement);
    shortestColumn.height += minHeightElement.scrollHeight;

    // Update column heights and last row elements
    columnHeights = getColumnHeights(columns);
    lastRowElements = getLastRowElements(columns);
    minHeightElement = getMinHeightElement(lastRowElements);

    if (!minHeightElement) break;
  }
}

const props = {
  items: ref([])
};

const waterfall = ref<HTMLElement | undefined>(undefined);

function imgsLoaded(): Promise<void> {
  return new Promise((resolve) => {
    const images = Array.from(document.getElementsByTagName('img'));
    let loadedImages = 0;

    images.forEach((img) => {
      if (img.complete) {
        loadedImages++;
        if (loadedImages === images.length) {
          resolve();
        }
      } else {
        img.onload = () => {
          loadedImages++;
          if (loadedImages === images.length) {
            resolve();
          }
        };
        img.onerror = () => {
          loadedImages++;
          if (loadedImages === images.length) {
            resolve();
          }
        };
      }
    });

    if (images.length === 0) {
      resolve();
    }
  });
}

watch(props.items, () => {
  if (waterfall.value === undefined) return;

  imgsLoaded().then(() => {
    console.log('图片加载完成');

    const columns = waterfall.value?.getElementsByClassName('column') as HTMLCollectionOf<HTMLDivElement>;

    if (columns) {
      balanceColumns(columns);
    }
  });
});