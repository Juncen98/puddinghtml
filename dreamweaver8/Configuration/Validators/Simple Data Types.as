// !!@ need a way to express dependencies between validators/formatters
mx.Validators.decimal = function(data)
{
	var gotdot = false;
	var s = string(data);
	if (s.length == 0) return false;
	for (var i = 0; i < s.length; i++)
	{
		var c = s.charAt(i);
		if ((c < "0") || (c > "9"))
		{
			if ((c == ".") && !gotdot)
				gotdot = true;
			else
				return false;
		}
	}
	return true;
}

mx.Validators.Integer = function(data)
{
	return mx.Validators.decimal(data) && (Math.round(data) == data);
}
