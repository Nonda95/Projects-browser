<?php
http_response_code(400);
$con = mysqli_connect("localhost", "user", "password", "db");
$data = json_decode(file_get_contents("php://input"));
$query = "SELECT path FROM Pictures WHERE project_id = $data->id";
$imgsResult = mysqli_query($con, $query);
$query = "DELETE FROM Projects WHERE id=$data->id";
if (mysqli_query($con, $query)) {
    if (mysqli_num_rows($imgsResult) != 0)
        while ($img = mysqli_fetch_assoc($imgsResult)) {
            unlink($img["path"]);
        }
    http_response_code(200);
    echo true;
}
mysqli_close($con);
?>