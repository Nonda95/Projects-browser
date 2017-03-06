/**
 * Created by osmalek on 07.12.2016.
 */
var myFilter = angular.module("myFilter", [])
        .filter("tagFilter", function () {
            return function (input, searchPhase) {
                if (searchPhase == null) {
                    return input;
                }
                var result = [];
                var searchStrings = searchPhase.split(/[\s,]+/);
                for (elementId in input) {
                    var foundKeywords = 0;
                    for (search in searchStrings) {
                        var found = false;
                        for (keyword in input[elementId].keywords) {
                            if (checkStrings(searchStrings[search], input[elementId].keywords[keyword]))
                                found = true;
                        }
                        if (found || searchStrings[search].length < 2)
                            foundKeywords++;
                    }
                    if (foundKeywords == searchStrings.length)
                        result.push(input[elementId]);
                }
                return result;
            }
        })
    ;

function checkStrings(searchPhase, keyword) {
    if (searchPhase.length > keyword.length) {
        return false;
    }
    var startIndex = 0;
    var index = findLetter(keyword, searchPhase.charAt(startIndex), 0, keyword.length);
    if (index < 0 && startIndex == 0) {
        startIndex++;
        index = findLetter(keyword, searchPhase.charAt(startIndex), 0, keyword.length);
    }
    while (index >= 0) {
        var hasMistake = startIndex > 0;
        var missingLetter = false;
        var actualIndex = index + 1;
        var i;
        for (i = startIndex + 1; i < searchPhase.length; i++) {
            var result = findLetter(keyword, searchPhase.charAt(i), actualIndex, actualIndex + 2);
            if (result < 0) {
                if (hasMistake || missingLetter) {
                    break;
                } else {
                    missingLetter = true;
                }
            } else if (result == actualIndex) {
                actualIndex++;
            } else if (result == actualIndex + 1) {
                if (hasMistake) {
                    break;
                } else {
                    hasMistake = true;
                    actualIndex += 2;
                }
            }
        }
        if (i == searchPhase.length) {
            return true;
        }
        index = findLetter(keyword, searchPhase.charAt(startIndex), index + 1, keyword.length);
        if (index < 0 && startIndex == 0) {
            startIndex++;
            index = findLetter(keyword, searchPhase.charAt(startIndex), 0, keyword.length);
        }
    }
    return false;
}

function findLetter(keyword, s, start, end) {
    var index = -1;
    for (var i = start; i < end && i < keyword.length; i++) {
        if (keyword.charAt(i) == s) {
            index = i;
            break;
        }
    }
    return index;
}