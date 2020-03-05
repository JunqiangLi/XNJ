//数组排序
export class numSort {

    static Sort(arr){
        arr.sort(function (m, n) {
            if (m < n) return -1
            else if (m > n) return 1
            else return 0
        });
    }
}