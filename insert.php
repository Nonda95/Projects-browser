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
$query = "INSERT INTO Projects (name, year, location, project_type, architect, type, style, measurement, price) VALUES (".
    (!empty($name) ?"'$name'" : 'NULL' ).",".
        (!empty($year) ? $year : 'NULL' ).",".
            (!empty($location) ?"'$location'" : 'NULL' ). ",".
                (!empty($project_type) ?"'$project_type'" : 'NULL' ). ",".
                    (!empty($architect) ?"'$architect'" : 'NULL' ). ",".
                        (!empty($type) ?"'$type'" : 'NULL' ). ",".
                            (!empty($style) ?"'$style'" : 'NULL' ). ",".
                                (!empty($measurement) ?$measurement: 'NULL' ). ",".
                                    (!empty($price) ?$price : 'NULL') . ")";
if($response = mysqli_query($con, $query)) {
    $id = mysqli_insert_id($con);
    http_response_code(200);
    foreach ($data->keywords as $keyword) {
        $keyword =  mysqli_real_escape_string($con, $keyword);
        if(!empty($keyword)) {
            $query = "INSERT INTO Keywords (project_id, keyword) VALUES($id, '$keyword')";
            mysqli_query($con, $query);
        }
    }
    foreach ($data->imgs as $img) {
        if(!empty($img)) {
            $query = "INSERT INTO Pictures (project_id, path) VALUES($id, '$img')";
            mysqli_query($con, $query);
        }
    }
    echo true;
}
mysqli_close($con);
?>