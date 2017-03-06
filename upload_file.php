<?php
http_response_code(400);
$filename = $_FILES['file']['name'];
$meta = $_POST;
$destination = 'res/' . $filename;
if(move_uploaded_file( $_FILES['file']['tmp_name'] , $destination )) {
    http_response_code(200);
}
echo $destination;
?>