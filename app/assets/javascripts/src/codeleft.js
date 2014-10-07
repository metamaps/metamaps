function fetchRelatives(node) {
    var myA = $.ajax({
        type: "Get",
        url: "/topics/" + node.id + "?format=json",
        success: function (data) {
            if (gType == "centered") {
                Mconsole.busy = true;
                Mconsole.op.sum(data, {
                    type: 'fade',
                    duration: 500,
                    hideLabels: false
                });
                Mconsole.graph.eachNode(function (n) {
                    n.eachAdjacency(function (a) {
                        if (!a.getData('showDesc')) {
                            a.setData('alpha', 0.4, 'start');
                            a.setData('alpha', 0.4, 'current');
                            a.setData('alpha', 0.4, 'end');
                        }
                    });
                });
                Mconsole.busy = false;
            } else {
                Mconsole.op.sum(data, {
                    type: 'nothing',
                });
                Mconsole.plot();
            }
        },
        error: function () {
            alert('failure');
        }
    });
}