$(document).ready(function() {

    let cameras = {
        "camaras": [
            {
                "ip": "0",
                "nombre": "-- Selecciona una cámara --"
            },
            {
                "ip": "192.168.0.101",
                "nombre": "192.168.0.101 - Cámara Atril"
            },
            {
                "ip": "192.168.0.100",
                "nombre": "192.168.0.100 - Cámara Cantantes"
            }
        ]
    };

    // Cargamos los datos de las camaras en la pantalla
    let $select = $('#selectCamIp');
    let storageIpCamera = localStorage.getItem('iafcj_cam_ip');
    $.each(cameras.camaras, function(k, camara) {
        let selectedCamera = (storageIpCamera == camara.ip) ? "selected" : "";
        $select.append("<option " + selectedCamera + " value='" + camara.ip + "'>" + camara.nombre + "</option>");
    });
    $('#cam_ip').val(storageIpCamera);

    $('#selectCamIp').change(function(e) {
        let selected_ip = $(this).val();
        $('#cam_ip').val(selected_ip);
        localStorage.setItem('iafcj_cam_ip', selected_ip);
    });

});