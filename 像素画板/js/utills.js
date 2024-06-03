export function debounce(fn, delay) {
  let timer = null
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}

//生成画板
export function init(height = 16, width = 16) {
  const arr = []
  for (let i = 0; i < height; i++) {
    arr.push([])
    for (let j = 0; j < width; j++) {
      arr[i].push("#00000000")
    }
  }
  return arr
}

//检测是否有被裁剪
function checkIsCut(drawingBoardArr, height, width) {
  if (drawingBoardArr.length > height) {
    for (let i = height; i < drawingBoardArr.length; i++) {
      if (drawingBoardArr[i].some(cell => cell !== "#00000000")) {
        return true;
      }
    }
  }
  if (drawingBoardArr[0].length > width) {
    for (let i = 0; i < height; i++) {
      for (let j = width; j < drawingBoardArr[0].length; j++) {
        if (drawingBoardArr[i][j] !== "#00000000") {
          return true;
        }
      }
    }
  }
  return false;
}


//更新画板
export function updateDrawingBoard(drawingBoardArr, height, width) {
  const res = {
    h: height.value,
    w: width.value,
    arr: [],
  }
  //最大值校验
  if (res.h > height.max) res.h = height.max;
  if (res.w > width.max) res.w = width.max;

  let isDataLoss = checkIsCut(drawingBoardArr, res.h, res.w);
  if (isDataLoss && !confirm(`画布大小为:${res.h}x${res.w}内容将被裁剪，是否继续？`)) {
    res.h = drawingBoardArr.length;
    res.w = drawingBoardArr[0].length;
    return res;
  }

  const arr = init(res.h, res.w);
  // 拷贝画板内容
  for (let i = 0; i < res.h; i++) {
    for (let j = 0; j < res.w; j++) {
      if (drawingBoardArr[i] && drawingBoardArr[i][j] !== undefined) {
        arr[i][j] = drawingBoardArr[i][j];
      } else {
        arr[i][j] = "#00000000";
      }
    }
  }
  res.arr = arr;
  return res;
};

