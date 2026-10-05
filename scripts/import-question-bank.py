"""Read the supplied XLSX without modifying its questions or answer choices."""
import json, sys
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

NS = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
source = Path(sys.argv[1])
with ZipFile(source) as archive:
    strings = [''.join(item.itertext()) for item in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('m:si', NS)]
    tree = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
    rows = []
    for row in tree.findall('m:sheetData/m:row',NS):
        cells = [''] * 18
        for cell in row.findall('m:c',NS):
            column = ''.join(c for c in cell.get('r') if c.isalpha())
            index = 0
            for letter in column:
                index = index*26 + ord(letter)-64
            value = cell.find('m:v',NS)
            text = value.text if value is not None else ''
            cells[index-1] = strings[int(text)] if cell.get('t') == 's' else text
        rows.append(cells)
headers, data = rows[0], rows[1:]
records = [dict(zip(headers, row)) for row in data if row[0]]
assert len(records) == 398, f'Unexpected bank size: {len(records)}'
for record in records:
    assert record['正解'] in 'ABCD'
    assert record['選択肢'+record['正解']] == record['正答'], record['ID']
target = Path(__file__).resolve().parent.parent / 'assets/kotoba-tower/question-bank.json'
target.write_text(json.dumps(records, ensure_ascii=False, indent=2)+'\n')
print(f'Imported {len(records)} unchanged questions')
