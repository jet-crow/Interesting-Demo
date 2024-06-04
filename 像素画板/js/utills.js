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
  if (isDataLoss && !confirm(`画布大小为:${res.w}x${res.h}内容将被裁剪，是否继续？`)) {
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

//解析图片文件生成画板内容
export function parseImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = Math.min(200 / img.width, 200 / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 将压缩过的图片转换为二维数组，内容是对应的颜色值
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const arr = [];
        const historyRecord = [];

        for (let i = 0; i < canvas.height; i++) {
          arr[i] = [];
          for (let j = 0; j < canvas.width; j++) {
            const index = (i * canvas.width + j) * 4;
            arr[i][j] = `rgb(${data[index]},${data[index + 1]},${data[index + 2]})`;
            historyRecord.push({
              row: i,
              col: j,
              color: arr[i][j]
            });
          }
        }

        // 读取文件名字
        const name = file.name.split('.')[0];
        resolve({
          name,
          height: canvas.height,
          width: canvas.width,
          drawingBoard: arr,
          historyRecord
        });
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
}