import * as playwright from 'playwright';
import * as dotenv from 'dotenv';
import * as parse from './utils/parse';
import * as chalk from 'chalk';

const { id, pw } = dotenv.config().parsed;

interface CourseType {
  title: string;
  prof: string;
  href: string;
}

(async () => {
  const browser = await playwright['chromium'].launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://myclass.ssu.ac.kr/login.php');

  await page.fill('#input-username', id);
  await page.fill('#input-password', pw);
  await page.click('input[name="loginbutton"]');

  console.log(chalk.green(`${id} 로그인 중...\n`));

  await page.waitForSelector('.course_box');
  const courseElements = await page.$$('.course_box');
  const courseList: Array<CourseType> = [];

  console.log(chalk.bgGreen('# 확인된 MyClass 수업'));
  let index = 1;
  for await (let course of courseElements) {
    const title = parse.removeHTMLTags(
      await course.$eval('.course-title h3', (el): string => el.innerHTML),
    );
    const prof = parse.removeSpecialChar(await course.$eval('.prof', (el): string => el.innerHTML));
    const href = await course.$eval('.course_link', (el): string => el.getAttribute('href'));

    courseList.push({ title, prof, href });
    console.log(`${index++}. ${title} - ${prof}`);
  }

  console.log(`\n${chalk.bgRed('# 결석 중인 MyClass 수업')}`);
  for await (let course of courseList) {
    await page.goto(course.href);

    const absentList = await page.$$('.name_text0');
    if (absentList.length) {
      for await (let absent of absentList) {
        const week = await absent.$eval('.sname', (el): string => el.innerHTML);
        console.log(`${chalk.red(`[결석-${week}주차]`)} ${course.title}`);
        console.log(`- ${course.href}#section-${week}`);
      }
    }
  }

  await browser.close();
})();
