mx.Formatters.LCase = function (obj)
{
	var result;
	var sep;
	for (var i in obj)
	{
		result += sep + obj[i].toLowerCase();
		sep = ",";
	}
	return result;
}

mx.Formatters.UCase = function (obj)
{
	var result;
	var sep;
	for (var i in obj)
	{
		result += sep + obj[i].toUpperCase();
		sep = ",";
	}
	return result;
}

