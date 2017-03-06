<?php
http_response_code(400);
$con = mysqli_connect("localhost", "user", "password", "db");
$data = json_decode(file_get_contents("php://input"));
$name = mysqli_real_escape_string($con, $data->name);
$year = mysqli_real_escape_string($con, $data->year);
$location = mysqli_real_escape_string($con, $data->location);
$project_type = mysqli_real_escape_string($con, $data->project_type);
$architect = mysqli_real_escape_string($con, $data->architect);
$type = mysqli_real_escape_string($con, $data->type);
$style = mysqli_real_escape_string($con, $data->style);
$measurement = mysqli_real_escape_string($con, $data->measurement);
$price = mysqli_real_escape_string($con, $data->price);
mysqli_set_charset($con, "utf8");
$query = "UPDATE Projects SET name = " .
    (!empty($name) ? "'$name'" : 'NULL') . ", year = " .
    (!empty($year) ? $year : 'NULL') . ", location = " .
    (!empty($location) ? "'$location'" : 'NULL') . ", project_type =" .
    (!empty($project_type) ? "'$project_type'" : 'NULL') . ", architect = " .
    (!empty($architect) ? "'$architect'" : 'NULL') . ", type = " .
    (!empty($type) ? "'$type'" : 'NULL') . ", style = " .
    (!empty($style) ? "'$style'" : 'NULL') . ", measurement = " .
    (!empty($measurement) ? $measurement : 'NULL') . ", price = " .
    (!empty($price) ? $price : 'NULL') . " WHERE ID = $data->id";
if (mysqli_query($con, $query)) {
    $query = "DELETE FROM Keywords WHERE project_id=$data->id";
    mysqli_query($con, $query);
    foreach ($data->keywords as $keyword) {
        $keyword = mysqli_real_escape_string($con, $keyword);
        if (!empty($keyword)) {
            $query = "INSERT INTO Keywords (project_id, keyword) VALUES($data->id, '$keyword')";
            mysqli_query($con, $query);
        }
    }
    $query = "SELECT path FROM Pictures WHERE project_id = $data->id";
    $imgsResult = mysqli_query($con, $query);
    if (mysqli_num_rows($imgsResult) != 0) {
        while ($img = mysqli_fetch_assoc($imgsResult)) {
            $toDelete = true;
            foreach ($data->imgs as $newImg) {
                if ($newImg == $img["path"]) {
                    $toDelete = false;
                }
            }
            if ($toDelete)
                unlink($img["path"]);
        }
    }

    $query = "DELETE FROM Pictures WHERE project_id=$data->id";
    mysqli_query($con, $query);
    foreach ($data->imgs as $path) {
        if (!empty($path)) {
            $query = "INSERT INTO Pictures (project_id, path) VALUES($data->id, '$path')";
            mysqli_query($con, $query);
        }
    }
    http_response_code(200);
    echo true;
}
mysqli_close($con);
?>


