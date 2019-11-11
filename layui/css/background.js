var temp;

/**
 * 订单检查 键每次的前10条数据返回（最多10条，不一定10条）
 * @returns {{orderMoney: Array, orderId: Array, orderRemark: Array, orderStatus: Array}}
 */
function checkOrder() {
    // 订单交易信息
    let $orderRemark = [];
    // 订单id
    let $orderId = [];
    // 订单状态
    let $orderStatus = [];
    // 订单金额
    let $orderMoney = [];

    let orderInfo = {
        orderRemark : $orderRemark,
        orderId : $orderId,
        orderStatus : $orderStatus,
        orderMoney : $orderMoney,
    };

    var errorInfo = $("#main > div.ui-recordtab > ul > li:nth-child(2) > a");
    // 到我的支付主页证明
    let huaBei = $("#J-assets-pcredit > div > div > div.i-assets-header.fn-clear > h3");
    // 查询支付宝账单时，需要扫描的二维码
    var img = $("#hover-instructions > img");

    let sysErr = $("#container > div.ui-securitycore > div > div > h4");

    if(huaBei.html() != undefined){
        window.location.href = 'https://mbillexprod.alipay.com/enterprise/tradeListQuery.htm'
        return
    }

    if(sysErr.html() == '由于系统异常，暂不能进行此操作。'){
        window.location.href = 'https://consumeprod.alipay.com/record/advanced.htm'
        return
    }


    // 如果img.html() != undefined 则说明获取的页面数据是扫码查账页面
    if(img.html() != undefined){
       console.log('查询支付宝账单时，需要扫描的二维码')
        //TODO 向后台发送数据
        // 将在查询账单时，需要扫描的二维码传给后端
        return
    }

    // 未登陆  未登陆时的页面中errorInfo.html() == undefined
    if(errorInfo.html() == undefined){
        console.log(errorInfo.html())
        //跳转到支付宝后台登陆页面
        // window.location.href = 'https://authem14.alipay.com/login/index.htm'
        // 要登陆二维码传给后端
        console.log("未登陆")
        $.ajax({
            type: 'GET',
            url: 'http://127.0.0.1:9001/login',
            success: function (data) {
            }
        });
        return
    }

    // 循环获取订单数据
    try {
        for (let i = 0; i < 10; i++) {
            try {
                // 抛出异常,说明此时的订单交易信息为链接,即为支付完成状态,后面直接用字符串截取即可
                $orderRemark[i] = $("#J-item-" + (i + 1) + " > td.name > p").html().replace(/\s+/g, "");

                // 什么也不做,因为这里取的是前30条数据,后面都为undefined,即substr报错
                $orderId[i] = $("#J-item-" + (i + 1) + " > td.tradeNo.ft-gray > p").html();

                $orderMoney[i] = $("#J-item-" + (i + 1) + " > td.amount > span").html().replace('+', "").replace(/\s+/g, "");


                if ($orderId[i].length > 50) {
                    // 订单号:45637132639422501973894 | 交易号:2019072122001473890518390371
                    $orderId[i] = $orderId[i].substr($orderId[i].lastIndexOf(':') + 1);
                } else {
                    // 流水号:20190721200040011100890011227942
                    $orderId[i] = $orderId[i].substr(4);
                }
            } catch (e) {
            }

            $orderStatus[i] = $("#J-item-" + (i + 1) + " > td.status > p:nth-child(1)").html();
            // 判断订单交易信息的长度,如果超过100则为支付成功，获取的是一个链接
            if ($orderRemark[i].length > 100) {
                // 将链接中的值给取出
                let start = $orderRemark[i].lastIndexOf('on">')
                let end = $orderRemark[i].lastIndexOf('</a>')
                $orderRemark[i] = $orderRemark[i].substring(start + 4, end)
            }

            // console.log($orderRemark[i] + " " + $orderId[i] + " " + $orderStatus[i] + " " + $orderMoney[i])
        }

        return orderInfo;
    }catch (e) {
        console.log(e)
        console.log('订单号不存在或者核实您的订单金额1')
        return orderInfo;
    }
}

// 页面刷新时
window.onload = function () {

    passiveCheck();

    // 得到支付宝真实数据
    let realOrder = checkOrder();
    console.log("realOrder: "+JSON.stringify(realOrder))

    $.ajax({
        type: 'GET',
        url: 'https://eladmin.szsydd.com/api/waitPayment/getAll',
        success: function (data) {
            //[WaitPayment(id=31, paymentRemarks=0019, paymentPrice=590.00, paymentType=0, paymentId=null)]
            // console.log("data"+data[0].id)
            for (let i=0;i<data.length;i++){

                let currentOrder = data[i];
               temp = currentOrder;

                let realOrderRemark = realOrder.orderRemark;
                let realOrderStatus = realOrder.orderStatus;
                let realOrderId = realOrder.orderId;
                let realOrderMoney = realOrder.orderMoney;
                for (let j=0;j<realOrderRemark.length;j++){
                    // 转账备注相同
                        if(('商品-'+ currentOrder.paymentRemarks) == realOrderRemark[j] && currentOrder.paymentPrice ==  realOrderMoney[j]){
                            // 得到 该订单对应的数据
                            let resultOrderStatus =  realOrder.orderStatus[j];
                            console.log("ok"+resultOrderStatus);
                            if(realOrderStatus[j] == '交易成功'){
                                $.ajax({
                                    type: 'GET',
                                    url: 'https://eladmin.szsydd.com/api/waitPayment/callback?paymentRemarks='+currentOrder.paymentRemarks+"&paymentId="+realOrderId[j]+"&paymentType=1",
                                    success: function (data) {

                                    }
                                });
                                return
                            }
                        }
                }


                $.ajax({
                    type: 'GET',
                    url: 'https://eladmin.szsydd.com/api/waitPayment/callback?paymentRemarks='+currentOrder.paymentRemarks+"&paymentId=00000"+"&paymentType=2",
                    success: function (data) {

                    }
                });
                return
                }
            },
        error: function (e) {
            console.log("error"+e)
        }
    });
}

//  半小时请求一次去向 后台请求 需要查询的数据
setInterval(function () {
    passiveCheck();
},'1800000');


/**
 * 被动查询,向后台获取指定待查询的数据
 */
function passiveCheck() {
    $.ajax({
        type: 'GET',
        url: 'http://39.98.168.25:8082/salesOrders/getAlipayOrderAndAlipayPrice',
        success: function (data) {
            console.log(data)
            // 得到支付宝真实数据
            let realOrder = checkOrder();
            for (let i=0;i<data.length;i++){

                let currentOrder = data[i];

                let realOrderStatus = realOrder.orderStatus;
                let realOrderId = realOrder.orderId;
                let realOrderMoney = realOrder.orderMoney;
                for (let j=0;j<realOrderId.length;j++){
                    // 订单号 匹配
                    if(currentOrder.alipayOrder == realOrderId[j]){

                        // 订单存在 但是 金额不匹配
                        if(realOrderMoney[j] != currentOrder.alipayPrice){
                            $.ajax({
                                type: 'GET',
                                url: 'http://39.98.168.25:8082/salesOrders/updateOrderStatus?paymentId='+realOrderId[j]+'&auditStatus=1&alipaySum='+realOrderMoney[j],
                                success: function (data) {

                                },
                                error: function (e) {
                                    console.log(e)
                                }
                            });

                            // 使用 return
                            break
                        }


                        // 订单存在 但是状态没有付款
                        let resultOrderStatus =  realOrder.orderStatus[j];
                        if(realOrderStatus[j] != '交易成功'){
                            // 订单号存在 但是 是未付款
                            $.ajax({
                                type: 'GET',
                                url: 'http://39.98.168.25:8082/salesOrders/updateOrderStatus?paymentId='+realOrderId[j]+'&auditStatus=3',
                                success: function (data) {

                                },
                                error: function (e) {
                                    console.log(e)
                                }
                            });
                            break
                        }

                        console.log("success")
                        // 订单号存在 金额正确 状态为付款
                        $.ajax({
                            type: 'GET',
                            url: 'http://39.98.168.25:8082/salesOrders/updateOrderStatus?paymentId='+realOrderId[j]+'&auditStatus=0',
                            success: function (data) {

                            },
                            error: function (e) {
                                console.log("订单号存在 金额正确 状态为付款:" +e)
                            }
                        });

                        break
                    }
                }

                // 订单号不存在
                $.ajax({
                    type: 'GET',
                    url: 'http://39.98.168.25:8082/salesOrders/updateOrderStatus?paymentId='+currentOrder.alipayOrder+'&auditStatus=2',
                    success: function (data) {

                    },
                    error: function (e) {
                        console.log("error: " +e)
                    }
                });
            }
        }
    });
}



/**
 *
 * @param orderRemark
 * @param money
 * @param orderId
 * @param flag
 * @param flag2   1 登陆二维码   |  2 查账扫描二维码
 * @constructor
 */
function Html2image(flag2) {
    let QRCode;
    let uploadUrl;
    if(flag2 == 1){
        // 登陆二维码div
        QRCode  = document.querySelector('#J-authcenter > div.authcenter-body.fn-clear');
        uploadUrl = '后端接收登陆图片二维码的地址'
    }
    if(flag2 == 2){
        // 查账扫描二维码的地址div
        QRCode  = document.querySelector('#container');
        uploadUrl = '后端接收查账图片二维码的地址'
    }

    console.log("qrcode: "+QRCode)

    html2canvas(QRCode).then(function (canvas) {
        let imageData = canvas.toDataURL(1);
        console.log(imageData)
    });

    //   后端接口确定时修改
    // if(QRCode != undefined){
    //     html2canvas(QRCode).then(function (canvas) {
    //         var imageData = canvas.toDataURL(1);
    //         console.log(imageData)
    //         $.psot({
    //             url: '127.0.0.1:8080/',
    //             data: {"imgBase64": imageData },
    //             dataType: "json",
    //             success: function (data) {
    //                 if(data.success == 200){
    //                     console.log("二维码扫描成功")
    //                      不需要什么操作，支付宝会自动跳转到之前的交易记录页面
    //                 }
    //             }
    //         });
    //     });
    // }
}



