//牌型
export const pokerType = [
    //两张
    ['4-5', 16],//'对喜'
    ['4-4-5', 21],//'三喜' 三芯
    ['4-5-5', 22],
    ['4-4-5-5', 25],//'四喜' 五芯或一亮子
    ['9-10', 15],//'对牛'


    //补充
    ['14-14', 37],
    ['14-14-14', 38],
    ['14-14-14-14',39],
    //三张

    ['1-2-3', 17],//'鱼'
    ['8-11-14', 18],//'摆'
    ['9-9-10', 19],//'三牛'
    ['9-10-10', 20],

    //四张
    ['8-11-14-14', 23],//'重天摆'
    ['9-9-10-10', 24],//'四牛' 算亮子

    //六张
    ['1-1-1-1-2-3', 26],//'鱼亮'
    ['1-2-2-2-2-3', 27],
    ['1-2-3-3-3-3', 28],
    ['1-1-2-2-3-3', 29],//双鱼
    ['8-8-8-8-11-14', 30],//'摆亮'
    ['8-11-11-11-11-14', 31],
    ['8-11-14-14-14-14', 32],
    ['8-8-11-11-14-14', 33],//双摆
    //九张
    ['1-1-1-2-2-2-3-3-3', 34],//三鱼，算三芯
    ['8-8-8-11-11-11-14-14', 35],//三摆，算三芯
    //12张
    ['1-1-2-2-3-3-8-8-11-11-14-14', 36],//龙凤朿：双鱼+双摆，无条件首朿，赢两家

];