import re
import os

filepath = 'app/page.tsx'

with open(filepath, 'r') as f:
    text = f.read()

# Fix the hrefs
text = re.sub(r'\{`\/\s+news\s+\/\s+\$\{\s*item\.id\s*\}\s+`\}', '{`/news/${item.id}`}', text)
text = re.sub(r'\{`\/\s+trainings\s+\/\s+\$\{\s*item\.id\s*\}\s+`\}', '{`/trainings/${item.id}`}', text)
text = re.sub(r'\{`\/\s+media\s+\/\s+\$\{\s*item\.id\s*\}\s+`\}', '{`/media/${item.id}`}', text)

# Fix classnames and dates
text = re.sub(r'\}\s+\/\$\{\s*item\.endMonth\s*\+\s*1\s*\}\/\s*\$\{\s*item\.endYear\s*\}\s+`', '}/${item.endMonth + 1}/${item.endYear}`', text)
text = re.sub(r'\$\{\s*item\.endDate\s*\}\s+\/\$\{', '${item.endDate}/${', text)
text = re.sub(r'px\s*-\s*1\.5', 'px-1.5', text)
text = re.sub(r'py\s*-\s*0\.5', 'py-0.5', text)
text = re.sub(r'text\s*-\s*\[10px\]', 'text-[10px]', text)
text = re.sub(r'font\s*-\s*bold', 'font-bold', text)

with open(filepath, 'w') as f:
    f.write(text)

print("done")
