<?php
$con = mysqli_connect("localhost", "user", "password", "db");
$query = "SELECT * from Projects";
mysqli_query($con, "SET CHARSET utf8");
$result = mysqli_query($con, $query);
$arr = array();
if (mysqli_num_rows($result) != 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $id = $row["id"];
        $query = "SELECT keyword FROM Keywords WHERE project_id = $id";
        $keywordsResult = mysqli_query($con, $query);
        $keywords = [];
        if (mysqli_num_rows($keywordsResult) != 0) {
            while ($keyword = mysqli_fetch_assoc($keywordsResult)) {
                $keywords[] = $keyword["keyword"];
            }
        }
        $row["keywords"] = $keywords;
        $query = "SELECT path FROM Pictures WHERE project_id = $id";
        $imgsResult = mysqli_query($con, $query);
        $imgs = [];
        if (mysqli_num_rows($imgsResult) != 0)
            while ($img = mysqli_fetch_assoc($imgsResult)) {
                $imgs[] = $img["path"];
            }
        $row["imgs"] = $imgs;
        $arr[$id] = $row;
    }
}
mysqli_close($con);
// Return json array containing data from the databasecon

echo $json_info = json_encode($arr, JSON_NUMERIC_CHECK);
?>