
local data = ...
print(data.content)
for k,v in pairs(data.to) do
    print("sent to:"..v)
    local to = v
    local from = "From: xsang.le@gmail.com\n"
    local suject = "Subject: " .. data.title .. "\n"
    local content = data.content.."\n"
    local cmd = 'echo "' .. utils.escape(from .. suject .. content) .. '"| sendmail ' .. to
    --print(cmd)
    local r = os.execute(cmd)
    if not r then
        print("Cannot send mail to: "..v)
    end
end
return "Email sent"