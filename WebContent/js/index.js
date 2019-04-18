$(document).ready(function()
	{
		$("#register1").find("form").submit(function(e)
		{
			e.preventDefault();
			var json={}
			var username=$(this).find("#username");
			if(username.val()=="")
			{
				username.focus();
				return;
			}
			else
				json["username"]=username.val();
			var password=$(this).find("#password");
			if(password.val()=="")
			{
				password.focus();
				return;
			}
			else
				json["password"]=password.val();
			var password1=$(this).find("#password1");
			
			if(password1.val()=="")
			{
				password1.focus();
				return;
			}
			else
				json["password1"]=password1.val();
			if(json["password1"]!=json["password"])
			{
				alert("两次输入密码不一致，请重新输入！");
				return;
			}
			var email=$(this).find("#email");
			if(email.val()=="")
			{
				email.focus();
				return;
			}
			else
				json["email"]=email.val();
			
			if(confirm("提交后不可修改，请确认是否提交"))
			{
				console.log(json);
				//$.post("register.jsp");
				alert("成功!");
			}
		});
			
		
		
			
	});
