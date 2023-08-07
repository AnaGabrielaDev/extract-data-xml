import xlsx from 'node-xlsx';
import { resolve } from "path"
import {createWriteStream} from "fs"

function groupBy(key: string, array: any[]) {
  let result: any[] = [];
  for (let i in array) {
    let added = false;
    for (let j in result) {
      if (result[j][key] == array[i][key]) {
        result[j].items.push(array[i]);
        added = true;
        break;
      }
    }
    if (!added) {
      let entry: {items: any[]} = {items: []};
      entry[key] = array[i][key];
      entry.items.push(array[i]);
      result.push(entry);
    }
  }
  return result;
}

function main() {
  const csvPath = resolve("assets", "alunos.xlsx")
  console.log(csvPath.length)
  const jsonPath = resolve("assets", "results.json")
  const result = xlsx.parse(csvPath)[0].data;

  //* 1 = cityName
  //* 2 = foreignSchoolId
  //* 3 = schoolName
  //* 4 = grade
  //* 5 = className
  //* !7 = foreignCityId
  //* !7 = foreignClassId
  //* !9 = foreignStudentId
  //* !10 = name
  let studentCounter = 0
  const stream = createWriteStream(jsonPath)
  stream.write(Buffer.from(`[`))
  let classes = groupBy('9', result)
  classes.map(({items: classObj}) => {
    return {
      className: classObj[0][10],
      schoolName: classObj[0][5],
      cityName: classObj[0][2],
      grade: classObj[0][6],
      foreignClassId: classObj[0][9].toString(),
      foreignSchoolId: classObj[0][3].toString(),
      foreignCityId: classObj[0][0].toString(),
      students: classObj.map(student => ({
        foreignId: student[11].toString(),
        name: student[12],
      }))
    }
  })
  .filter((student) => {
    return student.grade === 5 
  })
  .forEach((data, index) => {
    let obj = JSON.stringify(data)
    if(classes.length !== (index - 1)) {
      obj += `,`
    }

    studentCounter += data.students.length
    
    stream.write(Buffer.from(obj))
  })
  console.dir(studentCounter)
  stream.write(Buffer.from(`]`))
}

main();