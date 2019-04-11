mx.Validators.integer = function(data)
{
	return mx.Validators.decimal(data) && (Math.round(data) == data);
}
