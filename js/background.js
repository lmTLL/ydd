var temp;
var alipayOrder;
var alipayPrice;
/**
 * 订单检查 键每次的前10条数据返回（最多10条，不一定10条）
 * @returns {{orderMoney: Array, orderId: Array, orderRemark: Array, orderStatus: Array}}
 */
function checkOrder(alipayOrder,alipayPrice) {
    console.log('*********************************');
    console.log(alipayOrder)
    if ($("#precisionQueryValue").length>0){
        $("a[data-aspm-click='page.quickFilter___1ZR4V-moreQueryTip___2CtRG']").append('<div id="clickDiv"></div>');
        $("#clickDiv").click();
        $(".ant-form-item-control").attr("class","ant-form-item-control has-success")
        document.getElementById('precisionQueryValue').focus();
        $("#precisionQueryValue").attr("value",alipayOrder.toString());
        $("#precisionQueryValue").val(alipayOrder.toString())
        document.getElementById('precisionQueryValue').focus();
        for (let i=0;i<1000;i++){
            if (i==999){
                
            }
        }
        $("button[data-aspm-click='page.formOperations___qgFvM-antBtn']:eq(0)").focus();
        $("button[data-aspm-click='page.formOperations___qgFvM-antBtn']:eq(0)").focus();
        $("button[data-aspm-click='page.formOperations___qgFvM-antBtn']:eq(0)").click();
        setTimeout(function () {

            console.log($('#root > div > div > div > div.transitionTable___YrqYN > div:nth-child(2) > div > div > div > div > div > div.ant-table-scroll > div > table > tbody > tr > td:nth-child(4) > div > div:nth-child(1) > span').html())
            var payUser=$('#root > div > div > div > div.transitionTable___YrqYN > div:nth-child(2) > div > div > div > div > div > div.ant-table-scroll > div > table > tbody > tr > td:nth-child(4) > div > div:nth-child(1) > span').html();
            if ($('#root > div > div > div > div.transitionTable___YrqYN > div:nth-child(2) > div > div > div > div > div > div.ant-table-scroll > div > table > tbody > tr:nth-child(1) > td:nth-child(6) > div > span').length>0){
                var realPrice=$('#root > div > div > div > div.transitionTable___YrqYN > div:nth-child(2) > div > div > div > div > div > div.ant-table-scroll > div > table > tbody > tr:nth-child(1) > td:nth-child(6) > div > span').html().replace(',','').replace('+','');
                if (alipayPrice==realPrice){
                    console.log("审核通过！,系统金额："+alipayPrice)
                    console.log('*********************************');
                    $.ajax({
                        type: 'GET',
                        url: 'http://39.98.168.25:8082/salesOrders/updateOrderStatus?paymentId='+alipayOrder+'&auditStatus=0'+"&payUser="+payUser,
                        success: function (data) {

                        },
                        error: function (e) {
                            console.log("订单号存在 金额正确 状态为付款:" +e)
                        }
                    });
                }else {
                    console.log("审核拒绝！金额不正确,系统金额："+alipayPrice)
                    console.log('*********************************');
                    $.ajax({
                        type: 'GET',
                        url: 'http://39.98.168.25:8082/salesOrders/updateOrderStatus?paymentId='+alipayOrder+'&auditStatus=1&alipaySum='+realPrice,
                        success: function (data) {

                        },
                        error: function (e) {
                            console.log(e)
                        }
                    });
                }

            } else {
                console.log("审核拒绝！订单不存在")
	console.log('*********************************');
                $.ajax({
                    type: 'GET',
                    url: 'http://39.98.168.25:8082/salesOrders/updateOrderStatus?paymentId='+alipayOrder+'&auditStatus=2',
                    success: function (data) {

                    },
                    error: function (e) {
                        console.log("error: " +e)
                    }
                });
            }
        },1000)
    }
}

// 页面刷新时
window.onload = function () {
    setTimeout("passiveCheck()",1000);
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
            for (let i=0;i<data.length;i++){
                let currentOrder = data[i];
                //data[i].alipayOrder="2019080122001449580585599287";
	//console.log('*********************************');
                //console.log(data[i].alipayOrder)
                //data[i].alipayOrder.toString()
                //data[i].alipayPrice
                console.log(data[i].alipayOrder.toString())
                setTimeout(function () {
                    checkOrder(data[i].alipayOrder,data[i].alipayPrice)
                },4000*i)
                /*$(".ant-form-item-control").attr("class","ant-form-item-control has-success")
                $("#value").attr("value",data[i].alipayOrder.toString());
                $("#value").val(data[i].alipayOrder.toString())
                document.getElementById('value').focus();
                $("button[data-aspm-click='page.accurateButton___1W0W8-antBtn']:eq(0)").focus();
                $("button[data-aspm-click='page.accurateButton___1W0W8-antBtn']:eq(0)").click()*/
                //setTimeout("console.log($('#root > div > div > div > div:nth-child(3) > div > div > div > div > div > div > div.ant-table-scroll > div > table > tbody > tr > td:nth-child(5) > div > span > span').html())",3000)
                //sleep(5000);
            }
        }
    });
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    console.log("sss")
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
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



