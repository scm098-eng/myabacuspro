module.exports = {

"[project]/src/lib/questions.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "generateTest": (()=>generateTest),
    "getTestSettings": (()=>getTestSettings)
});
const TEST_CONFIG = {
    'addition-subtraction': {
        easy: {
            numQuestions: 50,
            timeLimit: 300,
            title: 'Addition & Subtraction (Easy)',
            icon: 'brain-circuit'
        },
        medium: {
            numQuestions: 100,
            timeLimit: 600,
            title: 'Addition & Subtraction (Medium)',
            icon: 'brain-circuit'
        },
        hard: {
            numQuestions: 150,
            timeLimit: 900,
            title: 'Addition & Subtraction (Hard)',
            icon: 'brain-circuit'
        }
    },
    multiplication: {
        easy: {
            numQuestions: 50,
            timeLimit: 300,
            title: 'Multiplication (Easy)',
            icon: 'x'
        },
        medium: {
            numQuestions: 100,
            timeLimit: 600,
            title: 'Multiplication (Medium)',
            icon: 'x'
        },
        hard: {
            numQuestions: 150,
            timeLimit: 900,
            title: 'Multiplication (Hard)',
            icon: 'x'
        }
    },
    division: {
        easy: {
            numQuestions: 50,
            timeLimit: 300,
            title: 'Division (Easy)',
            icon: 'divide'
        },
        medium: {
            numQuestions: 100,
            timeLimit: 600,
            title: 'Division (Medium)',
            icon: 'divide'
        },
        hard: {
            numQuestions: 150,
            timeLimit: 900,
            title: 'Division (Hard)',
            icon: 'divide'
        }
    },
    'basic-addition-plus-4': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +4 = +5 - 1',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-40': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +40 = +50 - 10',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-3': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +3 = +5 - 2',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-30': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +30 = +50 - 20',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-2': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +2 = +5 - 3',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-20': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +20 = +50 - 30',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-1': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +1 = +5 - 4',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-10': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +10 = +50 - 40',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-4': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -4 = -5 + 1',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-40': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -40 = -50 + 10',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-3': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -3 = -5 + 2',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-30': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -30 = -50 + 20',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-2': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -2 = -5 + 3',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-20': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -20 = -50 + 30',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-1': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -1 = -5 + 4',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-10': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: -10 = -50 + 40',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-9': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +9 = +10 - 1',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-90': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +90 = +100 - 10',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-8': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +8 = +10 - 2',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-80': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +80 = +100 - 20',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-7': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +7 = +10 - 3',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-70': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +70 = +100 - 30',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-6': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +6 = +10 - 4',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-60': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +60 = +100 - 40',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-5': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +5 = +10 - 5',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-50': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +50 = +100 - 50',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-4': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +4 = +10 - 6',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-40': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +40 = +100 - 60',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-3': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +3 = +10 - 7',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-30': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +30 = +100 - 70',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-2': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +2 = +10 - 8',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-20': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +20 = +100 - 80',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-1': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +1 = +10 - 9',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-10': {
        easy: {
            numQuestions: 28,
            timeLimit: 900,
            title: 'Formula: +10 = +100 - 90',
            icon: 'puzzle'
        }
    }
};
const preDefinedQuestions = {
    'basic-addition-plus-4': [
        {
            text: '1 + 1 + 2 + 4',
            answer: 8,
            options: []
        },
        {
            text: '2 + 2 - 3 + 4',
            answer: 5,
            options: []
        },
        {
            text: '3 + 4 + 2 - 9',
            answer: 0,
            options: []
        },
        {
            text: '3 + 5 - 5 + 4',
            answer: 7,
            options: []
        },
        {
            text: '9 - 4 + 3 - 5',
            answer: 3,
            options: []
        },
        {
            text: '1 + 2 - 1 + 4',
            answer: 6,
            options: []
        },
        {
            text: '7 - 5 + 2 + 4',
            answer: 8,
            options: []
        },
        {
            text: '2 + 4 + 3 - 1',
            answer: 8,
            options: []
        },
        {
            text: '1 + 1 + 1 + 4',
            answer: 7,
            options: []
        },
        {
            text: '2 - 2 + 3 + 4',
            answer: 7,
            options: []
        },
        {
            text: '1 + 3 + 4 - 5',
            answer: 3,
            options: []
        },
        {
            text: '69 - 5 + 4 - 3',
            answer: 65,
            options: []
        },
        {
            text: '5 + 3 - 7 + 4',
            answer: 5,
            options: []
        },
        {
            text: '3 + 4 - 2 - 5',
            answer: 0,
            options: []
        },
        {
            text: '2 + 4 + 1 + 1',
            answer: 8,
            options: []
        },
        {
            text: '14 + 4 - 3 + 1',
            answer: 16,
            options: []
        },
        {
            text: '55 - 5 + 3 + 4',
            answer: 57,
            options: []
        },
        {
            text: '12 + 4 - 5 + 3',
            answer: 14,
            options: []
        },
        {
            text: '21 + 4 + 4 - 9',
            answer: 20,
            options: []
        },
        {
            text: '2 + 2 + 4 - 3',
            answer: 5,
            options: []
        },
        {
            text: '37 - 6 + 4 + 3',
            answer: 38,
            options: []
        },
        {
            text: '22 + 4 + 3 - 8',
            answer: 21,
            options: []
        },
        {
            text: '99 - 5 + 4 - 6',
            answer: 92,
            options: []
        },
        {
            text: '53 + 4 + 1 - 2',
            answer: 56,
            options: []
        },
        {
            text: '63 + 4 - 2 + 4',
            answer: 69,
            options: []
        },
        {
            text: '67 - 1 - 5 + 4',
            answer: 65,
            options: []
        },
        {
            text: '56 - 6 + 4 + 4',
            answer: 58,
            options: []
        },
        {
            text: '17 - 6 + 4 + 4',
            answer: 19,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-addition-plus-40': [
        {
            text: '20 + 20 + 40',
            answer: 80,
            options: []
        },
        {
            text: '30 + 40 + 10',
            answer: 80,
            options: []
        },
        {
            text: '90 - 70 + 40',
            answer: 60,
            options: []
        },
        {
            text: '80 - 60 + 40',
            answer: 60,
            options: []
        },
        {
            text: '60 - 50 + 40',
            answer: 50,
            options: []
        },
        {
            text: '30 + 10 + 40',
            answer: 80,
            options: []
        },
        {
            text: '10 + 20 + 40',
            answer: 70,
            options: []
        },
        {
            text: '40 + 40 + 10',
            answer: 90,
            options: []
        },
        {
            text: '10 + 40 + 30',
            answer: 80,
            options: []
        },
        {
            text: '20 - 10 + 40',
            answer: 50,
            options: []
        },
        {
            text: '50 - 50 + 40',
            answer: 40,
            options: []
        },
        {
            text: '70 - 60 + 40',
            answer: 50,
            options: []
        },
        {
            text: '10 + 40 + 40',
            answer: 90,
            options: []
        },
        {
            text: '30 - 10 + 40',
            answer: 60,
            options: []
        },
        {
            text: '40 - 30 + 40',
            answer: 50,
            options: []
        },
        {
            text: '12 + 34 + 43',
            answer: 89,
            options: []
        },
        {
            text: '33 - 11 + 24',
            answer: 46,
            options: []
        },
        {
            text: '25 + 42 + 22',
            answer: 89,
            options: []
        },
        {
            text: '43 + 44 - 52',
            answer: 35,
            options: []
        },
        {
            text: '53 + 34 - 65',
            answer: 22,
            options: []
        },
        {
            text: '76 - 55 + 24',
            answer: 45,
            options: []
        },
        {
            text: '21 + 54 - 20',
            answer: 55,
            options: []
        },
        {
            text: '82 - 32 + 44',
            answer: 94,
            options: []
        },
        {
            text: '65 - 15 + 37',
            answer: 87,
            options: []
        },
        {
            text: '91 + 4 - 75',
            answer: 20,
            options: []
        },
        {
            text: '34 + 44 - 57',
            answer: 21,
            options: []
        },
        {
            text: '99 - 88 + 44',
            answer: 55,
            options: []
        },
        {
            text: '29 - 15 + 34',
            answer: 48,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-addition-plus-3': [
        {
            text: '8 - 5 + 4 + 2',
            answer: 9,
            options: []
        },
        {
            text: '8 - 5 + 3 + 3',
            answer: 9,
            options: []
        },
        {
            text: '4 + 3 - 6 + 4',
            answer: 5,
            options: []
        },
        {
            text: '2 + 2 + 3 - 2',
            answer: 5,
            options: []
        },
        {
            text: '7 - 6 + 4 - 5',
            answer: 0,
            options: []
        },
        {
            text: '5 + 3 - 6 + 3',
            answer: 5,
            options: []
        },
        {
            text: '3 + 3 + 3 - 6',
            answer: 3,
            options: []
        },
        {
            text: '6 - 5 + 4 + 3',
            answer: 8,
            options: []
        },
        {
            text: '2 + 1 + 3 + 2',
            answer: 8,
            options: []
        },
        {
            text: '3 + 4 - 5 + 3',
            answer: 5,
            options: []
        },
        {
            text: '9 - 5 + 3 - 2',
            answer: 5,
            options: []
        },
        {
            text: '7 + 2 - 7 + 3',
            answer: 5,
            options: []
        },
        {
            text: '4 - 2 + 3 + 4',
            answer: 9,
            options: []
        },
        {
            text: '2 - 2 + 3 + 3',
            answer: 6,
            options: []
        },
        {
            text: '2 + 3 - 5 + 7',
            answer: 7,
            options: []
        },
        {
            text: '57 - 7 + 2 + 3',
            answer: 55,
            options: []
        },
        {
            text: '78 - 7 + 4 + 4',
            answer: 79,
            options: []
        },
        {
            text: '29 - 2 + 5 - 3',
            answer: 29,
            options: []
        },
        {
            text: '34 + 4 - 6 + 3',
            answer: 35,
            options: []
        },
        {
            text: '13 + 3 - 5 + 3',
            answer: 14,
            options: []
        },
        {
            text: '33 + 3 - 1 + 4',
            answer: 39,
            options: []
        },
        {
            text: '53 + 3 - 5 + 4',
            answer: 55,
            options: []
        },
        {
            text: '22 + 4 - 5 + 4',
            answer: 25,
            options: []
        },
        {
            text: '23 + 3 - 6 + 7',
            answer: 27,
            options: []
        },
        {
            text: '24 + 4 - 6 + 3',
            answer: 25,
            options: []
        },
        {
            text: '55 - 5 + 2 + 3',
            answer: 55,
            options: []
        },
        {
            text: '12 + 3 + 4 - 2',
            answer: 17,
            options: []
        },
        {
            text: '67 - 5 + 3 + 2',
            answer: 67,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-addition-plus-30': [
        {
            text: '20 + 30 + 20',
            answer: 70,
            options: []
        },
        {
            text: '60 - 50 + 40',
            answer: 50,
            options: []
        },
        {
            text: '90 - 60 + 30',
            answer: 60,
            options: []
        },
        {
            text: '80 - 60 + 30',
            answer: 50,
            options: []
        },
        {
            text: '40 + 30 + 10',
            answer: 80,
            options: []
        },
        {
            text: '30 + 30 + 30',
            answer: 90,
            options: []
        },
        {
            text: '10 + 10 + 30',
            answer: 50,
            options: []
        },
        {
            text: '30 + 10 + 40',
            answer: 80,
            options: []
        },
        {
            text: '40 - 10 + 30',
            answer: 60,
            options: []
        },
        {
            text: '20 + 20 + 40',
            answer: 80,
            options: []
        },
        {
            text: '20 + 20 + 30',
            answer: 70,
            options: []
        },
        {
            text: '80 - 50 + 30',
            answer: 60,
            options: []
        },
        {
            text: '90 - 70 + 40',
            answer: 60,
            options: []
        },
        {
            text: '40 + 30 - 20',
            answer: 50,
            options: []
        },
        {
            text: '40 - 20 + 30',
            answer: 50,
            options: []
        },
        {
            text: '32 + 34 - 55',
            answer: 11,
            options: []
        },
        {
            text: '67 - 52 + 34',
            answer: 49,
            options: []
        },
        {
            text: '58 - 55 + 23',
            answer: 26,
            options: []
        },
        {
            text: '42 + 43 - 75',
            answer: 10,
            options: []
        },
        {
            text: '20 + 43 + 23',
            answer: 86,
            options: []
        },
        {
            text: '33 + 33 + 33',
            answer: 99,
            options: []
        },
        {
            text: '34 + 43 - 11',
            answer: 66,
            options: []
        },
        {
            text: '86 - 55 + 34',
            answer: 65,
            options: []
        },
        {
            text: '32 + 32 - 53',
            answer: 11,
            options: []
        },
        {
            text: '88 - 66 + 34',
            answer: 56,
            options: []
        },
        {
            text: '11 + 22 + 34',
            answer: 67,
            options: []
        },
        {
            text: '47 - 15 + 43',
            answer: 75,
            options: []
        },
        {
            text: '24 - 12 + 43',
            answer: 55,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-addition-plus-2': [
        {
            text: '5 - 5 + 4 + 2',
            answer: 6,
            options: []
        },
        {
            text: '4 + 2 + 3 - 9',
            answer: 0,
            options: []
        },
        {
            text: '3 + 2 - 5 + 2',
            answer: 2,
            options: []
        },
        {
            text: '8 - 5 + 2 + 1',
            answer: 6,
            options: []
        },
        {
            text: '7 + 2 - 5 + 3',
            answer: 7,
            options: []
        },
        {
            text: '2 + 2 + 4 - 6',
            answer: 2,
            options: []
        },
        {
            text: '9 - 7 + 2 + 3',
            answer: 7,
            options: []
        },
        {
            text: '1 + 6 - 5 + 3',
            answer: 5,
            options: []
        },
        {
            text: '6 + 3 - 6 + 2',
            answer: 5,
            options: []
        },
        {
            text: '9 - 8 + 2 + 2',
            answer: 5,
            options: []
        },
        {
            text: '5 + 4 - 5 + 4',
            answer: 8,
            options: []
        },
        {
            text: '8 - 7 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '2 + 2 + 2 - 6',
            answer: 0,
            options: []
        },
        {
            text: '6 + 3 - 5 + 3',
            answer: 7,
            options: []
        },
        {
            text: '5 + 4 - 6 + 4',
            answer: 7,
            options: []
        },
        {
            text: '43 + 2 - 5 + 9',
            answer: 49,
            options: []
        },
        {
            text: '52 + 2 + 2 - 6',
            answer: 50,
            options: []
        },
        {
            text: '71 + 8 - 5 + 2',
            answer: 76,
            options: []
        },
        {
            text: '27 - 6 + 3 + 4',
            answer: 28,
            options: []
        },
        {
            text: '93 + 3 - 9 + 2',
            answer: 89,
            options: []
        },
        {
            text: '18 - 7 + 1 + 2',
            answer: 14,
            options: []
        },
        {
            text: '22 + 2 + 2 - 5',
            answer: 21,
            options: []
        },
        {
            text: '11 + 3 + 2 - 6',
            answer: 10,
            options: []
        },
        {
            text: '82 + 1 + 2 + 4',
            answer: 89,
            options: []
        },
        {
            text: '63 + 6 - 8 + 4',
            answer: 65,
            options: []
        },
        {
            text: '24 + 3 - 7 + 9',
            answer: 29,
            options: []
        },
        {
            text: '29 - 6 + 2 + 1',
            answer: 26,
            options: []
        },
        {
            text: '73 + 2 + 3 - 7',
            answer: 71,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-addition-plus-20': [
        {
            text: '20 + 20 + 20',
            answer: 60,
            options: []
        },
        {
            text: '70 + 20 - 40',
            answer: 50,
            options: []
        },
        {
            text: '30 + 20 - 50',
            answer: 0,
            options: []
        },
        {
            text: '90 - 70 + 20',
            answer: 40,
            options: []
        },
        {
            text: '30 + 20 + 10',
            answer: 60,
            options: []
        },
        {
            text: '80 - 50 + 20',
            answer: 50,
            options: []
        },
        {
            text: '10 + 30 + 20',
            answer: 60,
            options: []
        },
        {
            text: '40 - 10 + 30',
            answer: 60,
            options: []
        },
        {
            text: '90 - 60 + 20',
            answer: 50,
            options: []
        },
        {
            text: '40 + 40 - 10',
            answer: 70,
            options: []
        },
        {
            text: '40 - 10 + 20',
            answer: 50,
            options: []
        },
        {
            text: '50 - 50 + 40',
            answer: 40,
            options: []
        },
        {
            text: '30 + 20 + 40',
            answer: 90,
            options: []
        },
        {
            text: '20 + 10 + 20',
            answer: 50,
            options: []
        },
        {
            text: '20 + 30 + 20',
            answer: 70,
            options: []
        },
        {
            text: '47 - 15 + 23',
            answer: 55,
            options: []
        },
        {
            text: '99 - 55 + 22',
            answer: 66,
            options: []
        },
        {
            text: '34 + 43 - 11',
            answer: 66,
            options: []
        },
        {
            text: '12 + 31 + 42',
            answer: 85,
            options: []
        },
        {
            text: '76 - 55 + 24',
            answer: 45,
            options: []
        },
        {
            text: '49 - 15 + 24',
            answer: 58,
            options: []
        },
        {
            text: '22 + 22 + 22',
            answer: 66,
            options: []
        },
        {
            text: '32 + 34 - 55',
            answer: 11,
            options: []
        },
        {
            text: '27 + 22 + 20',
            answer: 69,
            options: []
        },
        {
            text: '87 - 56 + 24',
            answer: 55,
            options: []
        },
        {
            text: '97 - 52 + 42',
            answer: 87,
            options: []
        },
        {
            text: '88 - 55 + 22',
            answer: 55,
            options: []
        },
        {
            text: '19 + 30 + 20',
            answer: 69,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-addition-plus-1': [
        {
            text: '3 + 6 - 5 + 1',
            answer: 5,
            options: []
        },
        {
            text: '9 - 5 + 1 + 3',
            answer: 8,
            options: []
        },
        {
            text: '2 + 3 - 5 + 9',
            answer: 9,
            options: []
        },
        {
            text: '5 + 2 - 6 + 4',
            answer: 5,
            options: []
        },
        {
            text: '4 + 1 + 3 - 5',
            answer: 3,
            options: []
        },
        {
            text: '3 + 2 - 5 + 7',
            answer: 7,
            options: []
        },
        {
            text: '9 - 5 + 1 + 1',
            answer: 6,
            options: []
        },
        {
            text: '2 + 2 + 1 + 4',
            answer: 9,
            options: []
        },
        {
            text: '4 + 1 + 3 - 8',
            answer: 0,
            options: []
        },
        {
            text: '7 - 5 + 2 + 1',
            answer: 5,
            options: []
        },
        {
            text: '1 + 8 - 5 + 1',
            answer: 5,
            options: []
        },
        {
            text: '8 - 5 + 2 + 4',
            answer: 9,
            options: []
        },
        {
            text: '4 + 1 + 4 - 9',
            answer: 0,
            options: []
        },
        {
            text: '3 - 3 + 4 + 1',
            answer: 5,
            options: []
        },
        {
            text: '6 - 5 + 4 + 4',
            answer: 9,
            options: []
        },
        {
            text: '33 - 3 + 4 + 1',
            answer: 35,
            options: []
        },
        {
            text: '26 - 5 + 3 + 1',
            answer: 25,
            options: []
        },
        {
            text: '71 + 5 - 5 + 4',
            answer: 75,
            options: []
        },
        {
            text: '54 + 0 + 1 + 3',
            answer: 58,
            options: []
        },
        {
            text: '55 - 5 + 4 + 1',
            answer: 55,
            options: []
        },
        {
            text: '63 + 2 + 4 - 9',
            answer: 60,
            options: []
        },
        {
            text: '86 + 3 - 5 + 1',
            answer: 85,
            options: []
        },
        {
            text: '93 + 2 + 4 - 1',
            answer: 98,
            options: []
        },
        {
            text: '11 + 2 + 1 + 1',
            answer: 15,
            options: []
        },
        {
            text: '77 - 6 + 3 + 4',
            answer: 78,
            options: []
        },
        {
            text: '22 + 2 + 1 + 4',
            answer: 29,
            options: []
        },
        {
            text: '89 - 6 + 2 - 5',
            answer: 80,
            options: []
        },
        {
            text: '44 + 1 - 5 + 5',
            answer: 45,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-addition-plus-10': [
        {
            text: '80 - 50 + 10',
            answer: 40,
            options: []
        },
        {
            text: '40 + 10 - 50',
            answer: 0,
            options: []
        },
        {
            text: '90 - 70 + 40',
            answer: 60,
            options: []
        },
        {
            text: '40 + 10 + 40',
            answer: 90,
            options: []
        },
        {
            text: '40 + 10 + 20',
            answer: 70,
            options: []
        },
        {
            text: '10 + 30 + 20',
            answer: 60,
            options: []
        },
        {
            text: '40 + 10 + 10',
            answer: 60,
            options: []
        },
        {
            text: '30 + 10 + 50',
            answer: 90,
            options: []
        },
        {
            text: '20 + 30 + 20',
            answer: 70,
            options: []
        },
        {
            text: '20 + 20 + 10',
            answer: 50,
            options: []
        },
        {
            text: '10 + 30 + 10',
            answer: 50,
            options: []
        },
        {
            text: '40 + 40 - 10',
            answer: 70,
            options: []
        },
        {
            text: '90 - 50 + 10',
            answer: 50,
            options: []
        },
        {
            text: '40 + 10 + 30',
            answer: 80,
            options: []
        },
        {
            text: '90 - 60 + 20',
            answer: 50,
            options: []
        },
        {
            text: '44 + 11 + 33',
            answer: 88,
            options: []
        },
        {
            text: '99 - 55 + 11',
            answer: 55,
            options: []
        },
        {
            text: '32 + 34 - 55',
            answer: 11,
            options: []
        },
        {
            text: '49 - 25 + 21',
            answer: 45,
            options: []
        },
        {
            text: '97 - 52 + 12',
            answer: 57,
            options: []
        },
        {
            text: '53 + 44 - 52',
            answer: 45,
            options: []
        },
        {
            text: '97 - 55 + 11',
            answer: 53,
            options: []
        },
        {
            text: '47 - 15 + 24',
            answer: 56,
            options: []
        },
        {
            text: '33 + 11 + 11',
            answer: 55,
            options: []
        },
        {
            text: '99 - 75 + 21',
            answer: 45,
            options: []
        },
        {
            text: '38 + 11 - 33',
            answer: 16,
            options: []
        },
        {
            text: '34 + 44 - 57',
            answer: 21,
            options: []
        },
        {
            text: '74 + 21 - 40',
            answer: 55,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-4': [
        {
            text: '8 - 4 + 3 + 1',
            answer: 8,
            options: []
        },
        {
            text: '2 + 2 + 2 + 2',
            answer: 8,
            options: []
        },
        {
            text: '6 - 4 + 7 - 4',
            answer: 5,
            options: []
        },
        {
            text: '4 - 4 + 4 + 5',
            answer: 9,
            options: []
        },
        {
            text: '1 + 3 + 5 - 4',
            answer: 5,
            options: []
        },
        {
            text: '4 + 5 - 3 - 4',
            answer: 2,
            options: []
        },
        {
            text: '3 + 6 - 4 - 4',
            answer: 1,
            options: []
        },
        {
            text: '4 - 3 + 4 - 4',
            answer: 1,
            options: []
        },
        {
            text: '7 - 5 + 3 - 4',
            answer: 1,
            options: []
        },
        {
            text: '5 - 4 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '1 + 8 - 4 - 4',
            answer: 1,
            options: []
        },
        {
            text: '2 + 3 - 4 + 7',
            answer: 8,
            options: []
        },
        {
            text: '7 - 4 + 1 + 1',
            answer: 5,
            options: []
        },
        {
            text: '6 - 2 - 4 + 1',
            answer: 1,
            options: []
        },
        {
            text: '4 + 3 - 4 + 6',
            answer: 9,
            options: []
        },
        {
            text: '88 - 4 + 1 + 3',
            answer: 88,
            options: []
        },
        {
            text: '59 - 3 - 4 + 7',
            answer: 59,
            options: []
        },
        {
            text: '76 - 4 + 3 + 3',
            answer: 78,
            options: []
        },
        {
            text: '75 - 4 + 2 + 2',
            answer: 75,
            options: []
        },
        {
            text: '24 + 1 - 4 + 7',
            answer: 28,
            options: []
        },
        {
            text: '12 + 3 - 4 + 6',
            answer: 17,
            options: []
        },
        {
            text: '43 + 2 - 4 + 8',
            answer: 49,
            options: []
        },
        {
            text: '34 + 1 + 3 - 4',
            answer: 34,
            options: []
        },
        {
            text: '32 + 6 - 4 + 5',
            answer: 39,
            options: []
        },
        {
            text: '85 - 4 + 3 + 1',
            answer: 85,
            options: []
        },
        {
            text: '89 - 4 - 4 + 6',
            answer: 87,
            options: []
        },
        {
            text: '43 + 5 - 4 + 5',
            answer: 49,
            options: []
        },
        {
            text: '56 - 1 - 4 + 7',
            answer: 58,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-40': [
        {
            text: '80 - 40 + 30',
            answer: 70,
            options: []
        },
        {
            text: '20 + 30 - 40',
            answer: 10,
            options: []
        },
        {
            text: '60 - 40 + 70',
            answer: 90,
            options: []
        },
        {
            text: '40 + 40 - 40',
            answer: 40,
            options: []
        },
        {
            text: '50 - 40 + 20',
            answer: 30,
            options: []
        },
        {
            text: '40 + 30 - 40',
            answer: 30,
            options: []
        },
        {
            text: '70 - 40 + 50',
            answer: 80,
            options: []
        },
        {
            text: '10 + 40 - 40',
            answer: 10,
            options: []
        },
        {
            text: '20 + 30 + 40',
            answer: 90,
            options: []
        },
        {
            text: '40 + 30 - 20',
            answer: 50,
            options: []
        },
        {
            text: '30 + 50 - 40',
            answer: 40,
            options: []
        },
        {
            text: '60 - 40 + 60',
            answer: 80,
            options: []
        },
        {
            text: '10 + 80 - 40',
            answer: 50,
            options: []
        },
        {
            text: '20 + 30 + 30',
            answer: 80,
            options: []
        },
        {
            text: '60 + 20 - 40',
            answer: 40,
            options: []
        },
        {
            text: '45 - 34 + 62',
            answer: 73,
            options: []
        },
        {
            text: '98 - 54 + 32',
            answer: 76,
            options: []
        },
        {
            text: '78 - 24 + 21',
            answer: 75,
            options: []
        },
        {
            text: '67 - 44 + 22',
            answer: 45,
            options: []
        },
        {
            text: '69 - 54 + 30',
            answer: 45,
            options: []
        },
        {
            text: '22 + 15 - 24',
            answer: 13,
            options: []
        },
        {
            text: '44 + 23 - 14',
            answer: 53,
            options: []
        },
        {
            text: '34 + 13 - 24',
            answer: 23,
            options: []
        },
        {
            text: '92 - 41 + 34',
            answer: 85,
            options: []
        },
        {
            text: '39 - 38 + 24',
            answer: 25,
            options: []
        },
        {
            text: '50 + 28 - 24',
            answer: 54,
            options: []
        },
        {
            text: '41 + 54 - 34',
            answer: 61,
            options: []
        },
        {
            text: '46 - 44 + 32',
            answer: 34,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-3': [
        {
            text: '5 - 3 + 6 - 3',
            answer: 5,
            options: []
        },
        {
            text: '8 - 4 + 5 - 3',
            answer: 6,
            options: []
        },
        {
            text: '9 - 3 - 3 + 6',
            answer: 9,
            options: []
        },
        {
            text: '2 + 3 - 4 + 5',
            answer: 6,
            options: []
        },
        {
            text: '6 - 3 + 6 - 7',
            answer: 2,
            options: []
        },
        {
            text: '8 - 4 + 3 + 1',
            answer: 8,
            options: []
        },
        {
            text: '3 + 5 - 2 - 3',
            answer: 3,
            options: []
        },
        {
            text: '5 - 4 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '7 - 5 + 3 - 3',
            answer: 2,
            options: []
        },
        {
            text: '3 + 5 - 1 - 3',
            answer: 4,
            options: []
        },
        {
            text: '1 + 6 - 3 - 2',
            answer: 2,
            options: []
        },
        {
            text: '4 + 3 - 4 + 6',
            answer: 9,
            options: []
        },
        {
            text: '4 + 2 - 5 + 3',
            answer: 4,
            options: []
        },
        {
            text: '5 + 3 - 7 + 5',
            answer: 6,
            options: []
        },
        {
            text: '7 - 5 + 3 - 4',
            answer: 1,
            options: []
        },
        {
            text: '65 - 3 + 4 - 3',
            answer: 63,
            options: []
        },
        {
            text: '74 - 4 + 1 - 4',
            answer: 67,
            options: []
        },
        {
            text: '44 + 2 - 3 + 2',
            answer: 45,
            options: []
        },
        {
            text: '75 - 3 + 3 - 4',
            answer: 71,
            options: []
        },
        {
            text: '43 - 3 + 2 + 7',
            answer: 49,
            options: []
        },
        {
            text: '12 + 5 - 3 + 2',
            answer: 16,
            options: []
        },
        {
            text: '24 - 4 + 1 - 7',
            answer: 14,
            options: []
        },
        {
            text: '56 - 3 + 6 - 9',
            answer: 50,
            options: []
        },
        {
            text: '54 - 1 - 3 + 6',
            answer: 56,
            options: []
        },
        {
            text: '32 + 7 - 4 - 3',
            answer: 32,
            options: []
        },
        {
            text: '22 + 3 - 3 + 6',
            answer: 28,
            options: []
        },
        {
            text: '32 + 5 - 3 - 2',
            answer: 32,
            options: []
        },
        {
            text: '24 - 2 + 3 + 2',
            answer: 27,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-30': [
        {
            text: '50 - 30 + 20',
            answer: 40,
            options: []
        },
        {
            text: '40 + 20 - 30',
            answer: 30,
            options: []
        },
        {
            text: '70 - 30 + 50',
            answer: 90,
            options: []
        },
        {
            text: '60 - 30 + 20',
            answer: 50,
            options: []
        },
        {
            text: '30 + 40 - 30',
            answer: 40,
            options: []
        },
        {
            text: '20 + 40 - 30',
            answer: 30,
            options: []
        },
        {
            text: '10 + 60 - 30',
            answer: 40,
            options: []
        },
        {
            text: '50 - 30 + 60',
            answer: 80,
            options: []
        },
        {
            text: '40 + 10 - 30',
            answer: 20,
            options: []
        },
        {
            text: '60 - 40 + 70',
            answer: 90,
            options: []
        },
        {
            text: '40 + 10 - 40',
            answer: 10,
            options: []
        },
        {
            text: '60 - 40 + 50',
            answer: 70,
            options: []
        },
        {
            text: '50 - 30 + 50',
            answer: 70,
            options: []
        },
        {
            text: '20 + 30 - 40',
            answer: 10,
            options: []
        },
        {
            text: '70 - 30 - 20',
            answer: 20,
            options: []
        },
        {
            text: '11 + 55 - 33',
            answer: 33,
            options: []
        },
        {
            text: '66 - 33 + 11',
            answer: 44,
            options: []
        },
        {
            text: '33 + 22 - 33',
            answer: 22,
            options: []
        },
        {
            text: '56 - 31 + 24',
            answer: 49,
            options: []
        },
        {
            text: '43 - 31 + 24',
            answer: 36,
            options: []
        },
        {
            text: '53 - 32 + 57',
            answer: 78,
            options: []
        },
        {
            text: '57 - 44 + 55',
            answer: 68,
            options: []
        },
        {
            text: '14 + 42 - 46',
            answer: 10,
            options: []
        },
        {
            text: '36 + 32 - 34',
            answer: 34,
            options: []
        },
        {
            text: '43 + 22 - 34',
            answer: 31,
            options: []
        },
        {
            text: '86 - 41 + 54',
            answer: 99,
            options: []
        },
        {
            text: '28 + 51 - 30',
            answer: 49,
            options: []
        },
        {
            text: '26 + 32 - 38',
            answer: 20,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-2': [
        {
            text: '8 - 4 + 4 - 2',
            answer: 6,
            options: []
        },
        {
            text: '5 - 2 + 6 - 5',
            answer: 4,
            options: []
        },
        {
            text: '9 - 3 - 2 + 5',
            answer: 9,
            options: []
        },
        {
            text: '6 - 2 + 3 - 1',
            answer: 6,
            options: []
        },
        {
            text: '4 - 2 + 3 - 2',
            answer: 3,
            options: []
        },
        {
            text: '5 - 4 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '8 - 3 - 2 + 1',
            answer: 4,
            options: []
        },
        {
            text: '6 - 3 + 2 - 2',
            answer: 3,
            options: []
        },
        {
            text: '3 + 5 - 1 - 3',
            answer: 4,
            options: []
        },
        {
            text: '7 - 4 + 2 - 2',
            answer: 3,
            options: []
        },
        {
            text: '8 - 4 + 5 - 3',
            answer: 6,
            options: []
        },
        {
            text: '1 + 3 + 5 - 4',
            answer: 5,
            options: []
        },
        {
            text: '5 - 3 + 7 - 5',
            answer: 4,
            options: []
        },
        {
            text: '2 + 2 + 5 - 2',
            answer: 7,
            options: []
        },
        {
            text: '1 + 5 - 2 - 2',
            answer: 2,
            options: []
        },
        {
            text: '78 - 3 - 2 + 6',
            answer: 79,
            options: []
        },
        {
            text: '61 + 5 - 2 - 4',
            answer: 60,
            options: []
        },
        {
            text: '38 - 4 + 3 - 2',
            answer: 35,
            options: []
        },
        {
            text: '44 + 1 - 4 + 7',
            answer: 48,
            options: []
        },
        {
            text: '79 - 3 - 2 + 5',
            answer: 79,
            options: []
        },
        {
            text: '55 - 2 + 6 - 7',
            answer: 52,
            options: []
        },
        {
            text: '18 - 4 + 5 - 3',
            answer: 16,
            options: []
        },
        {
            text: '64 + 3 - 2 - 2',
            answer: 63,
            options: []
        },
        {
            text: '32 + 7 - 4 - 3',
            answer: 32,
            options: []
        },
        {
            text: '43 + 2 - 3 + 7',
            answer: 49,
            options: []
        },
        {
            text: '21 + 7 - 4 + 3',
            answer: 27,
            options: []
        },
        {
            text: '99 - 4 - 2 + 1',
            answer: 94,
            options: []
        },
        {
            text: '42 + 3 - 2 + 1',
            answer: 44,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-20': [
        {
            text: '90 - 40 - 20',
            answer: 30,
            options: []
        },
        {
            text: '80 - 20 + 20',
            answer: 80,
            options: []
        },
        {
            text: '80 - 30 - 20',
            answer: 30,
            options: []
        },
        {
            text: '50 - 20 + 20',
            answer: 50,
            options: []
        },
        {
            text: '60 - 20 + 40',
            answer: 80,
            options: []
        },
        {
            text: '70 - 40 + 50',
            answer: 80,
            options: []
        },
        {
            text: '50 - 20 + 40',
            answer: 70,
            options: []
        },
        {
            text: '50 - 20 + 30',
            answer: 60,
            options: []
        },
        {
            text: '60 - 30 + 20',
            answer: 50,
            options: []
        },
        {
            text: '20 + 30 - 20',
            answer: 30,
            options: []
        },
        {
            text: '10 + 80 - 40',
            answer: 50,
            options: []
        },
        {
            text: '90 - 30 + 20',
            answer: 80,
            options: []
        },
        {
            text: '40 + 20 - 30',
            answer: 30,
            options: []
        },
        {
            text: '40 + 10 - 30',
            answer: 20,
            options: []
        },
        {
            text: '20 + 30 - 30',
            answer: 20,
            options: []
        },
        {
            text: '44 + 23 - 14',
            answer: 53,
            options: []
        },
        {
            text: '46 + 20 - 22',
            answer: 44,
            options: []
        },
        {
            text: '87 - 32 - 22',
            answer: 33,
            options: []
        },
        {
            text: '99 - 44 - 25',
            answer: 30,
            options: []
        },
        {
            text: '68 - 23 + 51',
            answer: 96,
            options: []
        },
        {
            text: '88 - 44 + 55',
            answer: 99,
            options: []
        },
        {
            text: '70 + 25 - 42',
            answer: 53,
            options: []
        },
        {
            text: '45 - 32 + 75',
            answer: 88,
            options: []
        },
        {
            text: '56 - 31 + 24',
            answer: 49,
            options: []
        },
        {
            text: '93 - 42 - 30',
            answer: 21,
            options: []
        },
        {
            text: '42 + 53 - 52',
            answer: 43,
            options: []
        },
        {
            text: '35 - 22 + 12',
            answer: 25,
            options: []
        },
        {
            text: '88 - 33 - 22',
            answer: 33,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-1': [
        {
            text: '2 + 5 - 2 - 1',
            answer: 4,
            options: []
        },
        {
            text: '4 - 1 + 1 + 3',
            answer: 7,
            options: []
        },
        {
            text: '9 - 4 - 1 + 2',
            answer: 6,
            options: []
        },
        {
            text: '1 - 1 + 5 - 1',
            answer: 4,
            options: []
        },
        {
            text: '4 + 4 - 4 + 5',
            answer: 9,
            options: []
        },
        {
            text: '3 + 2 - 1 - 2',
            answer: 2,
            options: []
        },
        {
            text: '2 + 3 - 1 - 1',
            answer: 3,
            options: []
        },
        {
            text: '6 - 2 + 3 - 1',
            answer: 6,
            options: []
        },
        {
            text: '5 - 1 + 3 - 7',
            answer: 0,
            options: []
        },
        {
            text: '7 - 2 - 1 + 2',
            answer: 6,
            options: []
        },
        {
            text: '6 - 3 + 6 - 7',
            answer: 2,
            options: []
        },
        {
            text: '8 - 4 - 1 - 3',
            answer: 0,
            options: []
        },
        {
            text: '7 - 5 - 1 + 4',
            answer: 5,
            options: []
        },
        {
            text: '4 + 4 - 1 - 1',
            answer: 6,
            options: []
        },
        {
            text: '4 + 3 - 4 + 6',
            answer: 9,
            options: []
        },
        {
            text: '14 - 1 - 1 + 3',
            answer: 15,
            options: []
        },
        {
            text: '28 - 3 - 1 + 2',
            answer: 26,
            options: []
        },
        {
            text: '85 - 1 - 4 + 1',
            answer: 81,
            options: []
        },
        {
            text: '39 - 7 + 3 - 1',
            answer: 34,
            options: []
        },
        {
            text: '43 + 5 - 4 + 5',
            answer: 49,
            options: []
        },
        {
            text: '44 + 2 - 3 + 2',
            answer: 45,
            options: []
        },
        {
            text: '33 + 2 - 1 - 1',
            answer: 33,
            options: []
        },
        {
            text: '59 - 3 - 4 + 7',
            answer: 59,
            options: []
        },
        {
            text: '61 + 4 - 1 + 1',
            answer: 65,
            options: []
        },
        {
            text: '64 + 3 - 2 - 2',
            answer: 63,
            options: []
        },
        {
            text: '69 - 8 - 4 - 1',
            answer: 56,
            options: []
        },
        {
            text: '78 - 3 - 2 + 6',
            answer: 79,
            options: []
        },
        {
            text: '34 + 1 - 3 + 6',
            answer: 38,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'basic-subtraction-minus-10': [
        {
            text: '50 - 10 - 10',
            answer: 30,
            options: []
        },
        {
            text: '20 + 30 - 10',
            answer: 40,
            options: []
        },
        {
            text: '50 - 10 + 20',
            answer: 60,
            options: []
        },
        {
            text: '30 + 20 - 10',
            answer: 40,
            options: []
        },
        {
            text: '70 - 40 + 50',
            answer: 80,
            options: []
        },
        {
            text: '50 - 10 + 40',
            answer: 80,
            options: []
        },
        {
            text: '20 + 30 - 20',
            answer: 30,
            options: []
        },
        {
            text: '40 + 30 + 20',
            answer: 90,
            options: []
        },
        {
            text: '10 + 40 - 10',
            answer: 40,
            options: []
        },
        {
            text: '20 + 30 - 40',
            answer: 10,
            options: []
        },
        {
            text: '60 - 10 - 10',
            answer: 40,
            options: []
        },
        {
            text: '10 + 40 - 40',
            answer: 10,
            options: []
        },
        {
            text: '90 - 40 - 10',
            answer: 40,
            options: []
        },
        {
            text: '80 - 30 - 10',
            answer: 40,
            options: []
        },
        {
            text: '90 - 40 - 20',
            answer: 30,
            options: []
        },
        {
            text: '15 - 11 + 42',
            answer: 46,
            options: []
        },
        {
            text: '33 - 33 + 55',
            answer: 55,
            options: []
        },
        {
            text: '68 - 23 + 51',
            answer: 96,
            options: []
        },
        {
            text: '23 + 32 - 11',
            answer: 44,
            options: []
        },
        {
            text: '69 - 54 - 11',
            answer: 4,
            options: []
        },
        {
            text: '67 - 12 - 13',
            answer: 42,
            options: []
        },
        {
            text: '42 + 53 - 52',
            answer: 43,
            options: []
        },
        {
            text: '35 - 21 + 32',
            answer: 46,
            options: []
        },
        {
            text: '77 - 22 - 31',
            answer: 24,
            options: []
        },
        {
            text: '56 - 31 + 24',
            answer: 49,
            options: []
        },
        {
            text: '25 - 11 + 55',
            answer: 69,
            options: []
        },
        {
            text: '93 - 43 + 12',
            answer: 62,
            options: []
        },
        {
            text: '22 + 15 - 24',
            answer: 13,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        })),
    'big-brother-addition-plus-9': [
        {
            text: '9 + 9 + 9 - 2',
            answer: 25,
            options: []
        },
        {
            text: '3 + 2 - 5 + 9',
            answer: 9,
            options: []
        },
        {
            text: '2 + 5 + 4 + 9 - 2',
            answer: 18,
            options: []
        },
        {
            text: '5 + 4 + 9 + 9',
            answer: 27,
            options: []
        },
        {
            text: '1 + 5 - 3 + 9',
            answer: 12,
            options: []
        },
        {
            text: '4 + 2 + 9 - 1',
            answer: 14,
            options: []
        },
        {
            text: '3 + 3 - 3 + 9 - 9',
            answer: 3,
            options: []
        },
        {
            text: '2 + 3 - 1 + 9',
            answer: 13,
            options: []
        },
        {
            text: '6 + 9 - 4 + 9',
            answer: 20,
            options: []
        },
        {
            text: '9 - 4 - 3 + 9',
            answer: 11,
            options: []
        },
        {
            text: '7 + 9 - 1 + 9',
            answer: 24,
            options: []
        },
        {
            text: '5 - 3 + 9 + 3',
            answer: 14,
            options: []
        },
        {
            text: '8 + 9 + 9 + 9',
            answer: 35,
            options: []
        },
        {
            text: '5 + 4 + 9 + 9',
            answer: 27,
            options: []
        },
        {
            text: '4 + 9 + 2 - 1',
            answer: 14,
            options: []
        },
        {
            text: '10 + 9 + 9 + 9',
            answer: 37,
            options: []
        },
        {
            text: '67 + 9 - 3 + 9',
            answer: 82,
            options: []
        },
        {
            text: '28 - 3 + 4 + 9',
            answer: 38,
            options: []
        },
        {
            text: '47 + 2 + 9 - 8',
            answer: 50,
            options: []
        },
        {
            text: '88 + 9 - 7 + 9',
            answer: 99,
            options: []
        },
        {
            text: '99 - 9 + 5 + 4',
            answer: 99,
            options: []
        },
        {
            text: '70 + 2 + 3 + 4',
            answer: 79,
            options: []
        },
        {
            text: '50 + 5 + 3 + 9',
            answer: 67,
            options: []
        },
        {
            text: '38 + 9 - 3 - 4',
            answer: 40,
            options: []
        },
        {
            text: '22 + 9 + 9 + 9',
            answer: 49,
            options: []
        },
        {
            text: '75 + 4 + 9 - 7',
            answer: 81,
            options: []
        },
        {
            text: '66 + 3 - 9 + 9',
            answer: 69,
            options: []
        },
        {
            text: '12 + 2 + 4 + 9',
            answer: 27,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: generateOptions(q.answer)
        }))
};
function getTestSettings(testId, difficulty) {
    return TEST_CONFIG[testId]?.[difficulty];
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(array) {
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [
            array[j],
            array[i]
        ];
    }
    return array;
}
function generateOptions(correctAnswer) {
    const options = new Set([
        correctAnswer
    ]);
    const range = Math.max(10, Math.abs(Math.floor(correctAnswer * 0.2)));
    while(options.size < 4){
        let wrongAnswer;
        if (correctAnswer < 10 && correctAnswer >= 0) {
            wrongAnswer = getRandomInt(0, 9);
        } else {
            const minOption = Math.max(0, correctAnswer - range);
            const maxOption = correctAnswer + range;
            wrongAnswer = getRandomInt(minOption, maxOption);
        }
        if (wrongAnswer !== correctAnswer) {
            options.add(wrongAnswer);
        }
    }
    return shuffleArray(Array.from(options));
}
function generateTest(testId, difficulty) {
    const settings = getTestSettings(testId, difficulty);
    if (!settings) {
        return [];
    }
    if (preDefinedQuestions[testId]) {
        const allQuestions = preDefinedQuestions[testId];
        // For formula tests, we want to ensure variety by shuffling.
        return shuffleArray([
            ...allQuestions
        ]).slice(0, settings.numQuestions);
    }
    const questions = [];
    const [min, max] = getNumberRange(difficulty);
    for(let i = 0; i < settings.numQuestions; i++){
        let questionText;
        let answer;
        switch(testId){
            case 'addition-subtraction':
                {
                    const numTerms = 4;
                    let numbers = [];
                    let tempResult = getRandomInt(min, max);
                    numbers.push(tempResult);
                    for(let j = 0; j < numTerms - 1; j++){
                        let op = getRandomInt(0, 1) === 0 ? '+' : '-';
                        const nextNum = getRandomInt(min, max);
                        if (op === '-' && tempResult < nextNum) {
                            op = '+';
                        }
                        numbers.push(op);
                        numbers.push(nextNum);
                        if (op === '+') {
                            tempResult += nextNum;
                        } else {
                            tempResult -= nextNum;
                        }
                    }
                    questionText = numbers.join(' ');
                    answer = tempResult;
                    break;
                }
            case 'multiplication':
                const m1_max = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 99 : 999;
                const m2_max = difficulty === 'hard' ? 99 : 9;
                const m1 = getRandomInt(min, m1_max);
                const m2 = getRandomInt(1, m2_max);
                answer = m1 * m2;
                questionText = `${m1} × ${m2}`;
                break;
            case 'division':
                const divisor = getRandomInt(2, 9);
                const [answer_min, answer_max] = getNumberRange(difficulty);
                answer = getRandomInt(answer_min, answer_max);
                const dividend = divisor * answer;
                questionText = `${dividend} ÷ ${divisor}`;
                break;
            default:
                // Fallback for any formula tests without predefined questions yet
                questionText = "1 + 1";
                answer = 2;
                break;
        }
        questions.push({
            text: questionText,
            options: generateOptions(answer),
            answer: answer
        });
    }
    return questions;
}
function getNumberRange(difficulty) {
    switch(difficulty){
        case 'easy':
            return [
                1,
                9
            ];
        case 'medium':
            return [
                10,
                99
            ];
        case 'hard':
            return [
                100,
                999
            ];
        default:
            return [
                1,
                9
            ];
    }
}
}}),
"[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Card": (()=>Card),
    "CardContent": (()=>CardContent),
    "CardDescription": (()=>CardDescription),
    "CardFooter": (()=>CardFooter),
    "CardHeader": (()=>CardHeader),
    "CardTitle": (()=>CardTitle)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("rounded-lg border bg-card text-card-foreground shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, this));
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 p-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 24,
        columnNumber: 3
    }, this));
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-2xl font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 36,
        columnNumber: 3
    }, this));
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 51,
        columnNumber: 3
    }, this));
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 63,
        columnNumber: 3
    }, this));
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 71,
        columnNumber: 3
    }, this));
CardFooter.displayName = "CardFooter";
;
}}),
"[project]/src/components/ui/progress.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Progress": (()=>Progress)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-progress/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const Progress = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, value, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Indicator"], {
            className: "h-full w-full flex-1 bg-primary transition-all",
            style: {
                transform: `translateX(-${100 - (value || 0)}%)`
            }
        }, void 0, false, {
            fileName: "[project]/src/components/ui/progress.tsx",
            lineNumber: 20,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/progress.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, this));
Progress.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
;
}}),
"[project]/src/components/ui/alert-dialog.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "AlertDialog": (()=>AlertDialog),
    "AlertDialogAction": (()=>AlertDialogAction),
    "AlertDialogCancel": (()=>AlertDialogCancel),
    "AlertDialogContent": (()=>AlertDialogContent),
    "AlertDialogDescription": (()=>AlertDialogDescription),
    "AlertDialogFooter": (()=>AlertDialogFooter),
    "AlertDialogHeader": (()=>AlertDialogHeader),
    "AlertDialogOverlay": (()=>AlertDialogOverlay),
    "AlertDialogPortal": (()=>AlertDialogPortal),
    "AlertDialogTitle": (()=>AlertDialogTitle),
    "AlertDialogTrigger": (()=>AlertDialogTrigger)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-alert-dialog/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const AlertDialog = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"];
const AlertDialogTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Trigger"];
const AlertDialogPortal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Portal"];
const AlertDialogOverlay = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Overlay"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
        ...props,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 19,
        columnNumber: 3
    }, this));
AlertDialogOverlay.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Overlay"].displayName;
const AlertDialogContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AlertDialogPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AlertDialogOverlay, {}, void 0, false, {
                fileName: "[project]/src/components/ui/alert-dialog.tsx",
                lineNumber: 35,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Content"], {
                ref: ref,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className),
                ...props
            }, void 0, false, {
                fileName: "[project]/src/components/ui/alert-dialog.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 34,
        columnNumber: 3
    }, this));
AlertDialogContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Content"].displayName;
const AlertDialogHeader = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-2 text-center sm:text-left", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 52,
        columnNumber: 3
    }, this);
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 66,
        columnNumber: 3
    }, this);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-lg font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 80,
        columnNumber: 3
    }, this));
AlertDialogTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"].displayName;
const AlertDialogDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 92,
        columnNumber: 3
    }, this));
AlertDialogDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"].displayName;
const AlertDialogAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buttonVariants"])(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 105,
        columnNumber: 3
    }, this));
AlertDialogAction.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"].displayName;
const AlertDialogCancel = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Cancel"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buttonVariants"])({
            variant: "outline"
        }), "mt-2 sm:mt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 117,
        columnNumber: 3
    }, this));
AlertDialogCancel.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Cancel"].displayName;
;
}}),
"[project]/src/components/ui/scroll-area.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ScrollArea": (()=>ScrollArea),
    "ScrollBar": (()=>ScrollBar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-scroll-area/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const ScrollArea = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative overflow-hidden", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"], {
                className: "h-full w-full rounded-[inherit]",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 17,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrollBar, {}, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 20,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Corner"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 21,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/scroll-area.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, this));
ScrollArea.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
const ScrollBar = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, orientation = "vertical", ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"], {
        ref: ref,
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollAreaThumb"], {
            className: "relative flex-1 rounded-full bg-border"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/scroll-area.tsx",
            lineNumber: 43,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/scroll-area.tsx",
        lineNumber: 30,
        columnNumber: 3
    }, this));
ScrollBar.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"].displayName;
;
}}),
"[project]/src/components/TestPageClient.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TestPageClient)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/progress.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-ssr] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert-dialog.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/scroll-area.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function TestPageClient({ testId, difficulty, settings }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [questions, setQuestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [userAnswers, setUserAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(settings.timeLimit);
    const [selectedOption, setSelectedOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAnswered, setIsAnswered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [startTime, setStartTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isFinished, setIsFinished] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const questionButtonRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const generatedQuestions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateTest"])(testId, difficulty);
        setQuestions(generatedQuestions);
        setUserAnswers(new Array(generatedQuestions.length).fill(null));
        setStartTime(Date.now());
        questionButtonRefs.current = new Array(generatedQuestions.length);
    }, [
        testId,
        difficulty
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (questionButtonRefs.current[currentQuestionIndex]) {
            questionButtonRefs.current[currentQuestionIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [
        currentQuestionIndex
    ]);
    const finishTest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (isFinished) return;
        setIsFinished(true);
        const score = userAnswers.reduce((acc, answer, index)=>{
            if (answer !== null && questions.length > 0 && answer === questions[index].answer) {
                return acc + 1;
            }
            return acc;
        }, 0);
        if (user) {
            const accuracy = questions.length > 0 ? score / questions.length * 100 : 0;
            const timeSpent = settings.timeLimit - timeLeft;
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["firebaseApp"]);
            const resultData = {
                userId: user.uid,
                testId,
                difficulty,
                score,
                totalQuestions: questions.length,
                accuracy,
                timeSpent,
                timeLeft,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            };
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(db, 'testResults'), resultData);
            } catch (error) {
                console.error("Error saving test results: ", error);
            }
        }
        // Store detailed results in session storage
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        router.replace(`/results?score=${score}&total=${questions.length}&time=${timeLeft}`);
    }, [
        userAnswers,
        questions,
        router,
        timeLeft,
        user,
        testId,
        difficulty,
        settings.timeLimit,
        isFinished
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (questions.length === 0 || !startTime) return;
        if (timeLeft <= 0) {
            finishTest();
            return;
        }
        const timer = setInterval(()=>{
            setTimeLeft((prev)=>prev - 1);
        }, 1000);
        return ()=>clearInterval(timer);
    }, [
        timeLeft,
        finishTest,
        questions.length,
        startTime
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Ensure the test doesn't prematurely finish on initial render
        if (!isFinished && questions.length > 0 && userAnswers.length === questions.length && !userAnswers.includes(null)) {
            finishTest();
        }
    }, [
        userAnswers,
        finishTest,
        isFinished,
        questions.length
    ]);
    const jumpToQuestion = (index)=>{
        setCurrentQuestionIndex(index);
        setSelectedOption(null);
        setIsAnswered(false);
    };
    const handleAnswer = (answer)=>{
        if (isAnswered) return;
        const newAnswers = [
            ...userAnswers
        ];
        newAnswers[currentQuestionIndex] = answer;
        // Set these states before moving on
        setIsAnswered(true);
        setSelectedOption(answer);
        setUserAnswers(newAnswers);
        setTimeout(()=>{
            if (currentQuestionIndex < questions.length - 1) {
                jumpToQuestion(currentQuestionIndex + 1);
            }
        // The useEffect will handle finishing the test on the last question
        }, 700);
    };
    const currentQuestion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>questions[currentQuestionIndex], [
        questions,
        currentQuestionIndex
    ]);
    const progress = currentQuestionIndex / questions.length * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if (questions.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "h-12 w-12 animate-spin text-primary"
                }, void 0, false, {
                    fileName: "[project]/src/components/TestPageClient.tsx",
                    lineNumber: 163,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "ml-4 text-lg",
                    children: "Generating your test..."
                }, void 0, false, {
                    fileName: "[project]/src/components/TestPageClient.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TestPageClient.tsx",
            lineNumber: 162,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-8c46294c7212d7b8" + " " + "max-w-3xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                className: "shadow-2xl relative overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8c46294c7212d7b8" + " " + "flex justify-between items-center mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-2xl font-headline",
                                        children: settings.title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 174,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8c46294c7212d7b8" + " " + ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2 font-semibold text-lg p-2 rounded-md", timeLeft < 60 && 'text-destructive-foreground bg-destructive/80') || ""),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                                className: "h-6 w-6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TestPageClient.tsx",
                                                lineNumber: 176,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-8c46294c7212d7b8",
                                                children: [
                                                    minutes,
                                                    ":",
                                                    seconds.toString().padStart(2, '0')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TestPageClient.tsx",
                                                lineNumber: 177,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TestPageClient.tsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                                children: [
                                    "Question ",
                                    currentQuestionIndex + 1,
                                    " of ",
                                    questions.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TestPageClient.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Progress"], {
                                value: progress,
                                className: "w-full mt-2"
                            }, void 0, false, {
                                fileName: "[project]/src/components/TestPageClient.tsx",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TestPageClient.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollArea"], {
                                className: "w-full whitespace-nowrap rounded-md border my-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-8c46294c7212d7b8" + " " + "flex w-max space-x-2 p-2",
                                        children: questions.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                ref: (el)=>questionButtonRefs.current[index] = el,
                                                onClick: ()=>jumpToQuestion(index),
                                                variant: currentQuestionIndex === index ? 'default' : 'outline',
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-10 h-10", userAnswers[index] !== null && "bg-green-200 border-green-400 text-green-800 hover:bg-green-300"),
                                                children: index + 1
                                            }, index, false, {
                                                fileName: "[project]/src/components/TestPageClient.tsx",
                                                lineNumber: 187,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 185,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollBar"], {
                                        orientation: "horizontal"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 198,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TestPageClient.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8c46294c7212d7b8" + " " + "text-center my-8 md:my-12 transition-opacity duration-300",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-8c46294c7212d7b8" + " " + "text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-foreground whitespace-pre-wrap",
                                        children: currentQuestion.text
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 202,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-8c46294c7212d7b8" + " " + "text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-foreground whitespace-pre-wrap mt-4",
                                        children: "= ?"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 205,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, currentQuestionIndex, true, {
                                fileName: "[project]/src/components/TestPageClient.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-8c46294c7212d7b8" + " " + "grid grid-cols-1 sm:grid-cols-2 gap-4",
                                children: currentQuestion.options.map((option, index)=>{
                                    const isCorrect = option === currentQuestion.answer;
                                    const isSelected = selectedOption === option;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: ()=>handleAnswer(option),
                                        disabled: isAnswered,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("h-20 text-3xl font-bold transition-all duration-300 transform hover:scale-105", isAnswered && isSelected && !isCorrect && "bg-destructive hover:bg-destructive/90 shake", isAnswered && isCorrect && "bg-green-500 hover:bg-green-500/90"),
                                        variant: "outline",
                                        children: option
                                    }, index, false, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 215,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/TestPageClient.tsx",
                                lineNumber: 209,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TestPageClient.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TestPageClient.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-8c46294c7212d7b8" + " " + "mt-6 flex justify-end",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialog"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogTrigger"], {
                            asChild: true,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "destructive",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        className: "mr-2 h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TestPageClient.tsx",
                                        lineNumber: 237,
                                        columnNumber: 17
                                    }, this),
                                    "End Test"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TestPageClient.tsx",
                                lineNumber: 236,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/TestPageClient.tsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogContent"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogHeader"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogTitle"], {
                                            children: "Are you sure you want to end the test?"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TestPageClient.tsx",
                                            lineNumber: 243,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogDescription"], {
                                            children: "Your progress will be saved and you will be taken to the results page. You cannot undo this action."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TestPageClient.tsx",
                                            lineNumber: 244,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TestPageClient.tsx",
                                    lineNumber: 242,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogFooter"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogCancel"], {
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TestPageClient.tsx",
                                            lineNumber: 249,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDialogAction"], {
                                            onClick: finishTest,
                                            children: "Yes, end test"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TestPageClient.tsx",
                                            lineNumber: 250,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TestPageClient.tsx",
                                    lineNumber: 248,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TestPageClient.tsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TestPageClient.tsx",
                    lineNumber: 234,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/TestPageClient.tsx",
                lineNumber: 233,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "8c46294c7212d7b8",
                children: "@keyframes shake{0%,to{transform:translate(0)}10%,30%,50%,70%,90%{transform:translate(-5px)}20%,40%,60%,80%{transform:translate(5px)}}.shake.jsx-8c46294c7212d7b8{animation:.5s ease-in-out shake}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TestPageClient.tsx",
        lineNumber: 170,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/components/ui/alert.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Alert": (()=>Alert),
    "AlertDescription": (()=>AlertDescription),
    "AlertTitle": (()=>AlertTitle)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const alertVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground", {
    variants: {
        variant: {
            default: "bg-background text-foreground",
            destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
const Alert = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, variant, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        role: "alert",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(alertVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert.tsx",
        lineNumber: 26,
        columnNumber: 3
    }, this));
Alert.displayName = "Alert";
const AlertTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("mb-1 font-medium leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert.tsx",
        lineNumber: 39,
        columnNumber: 3
    }, this));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm [&_p]:leading-relaxed", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert.tsx",
        lineNumber: 51,
        columnNumber: 3
    }, this));
AlertDescription.displayName = "AlertDescription";
;
}}),
"[project]/src/hooks/usePageBackground.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "usePageBackground": (()=>usePageBackground)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
function usePageBackground(imageUrl) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const body = document.body;
        body.style.backgroundImage = `url(${imageUrl})`;
        return ()=>{
        // Optional: Reset background when component unmounts
        // body.style.backgroundImage = '';
        };
    }, [
        imageUrl
    ]);
}
}}),
"[project]/src/components/TestPageWrapper.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TestPageWrapper)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageBackground$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/usePageBackground.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function TestPageWrapper({ children }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageBackground$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePageBackground"])('https://placehold.co/1920x1080/1f2937/d1d5db?text=.');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
}}),
"[project]/src/app/tests/[testId]/[difficulty]/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TestPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TestPageClient$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TestPageClient.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-ssr] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/terminal.js [app-ssr] (ecmascript) <export default as Terminal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TestPageWrapper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TestPageWrapper.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/skeleton.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
function TestPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const { testId, difficulty } = params;
    const { profile, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTestSettings"])(testId, difficulty);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center h-64 gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                    className: "h-8 w-48"
                }, void 0, false, {
                    fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                    lineNumber: 26,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                    className: "h-6 w-64"
                }, void 0, false, {
                    fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                    lineNumber: 27,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                    className: "h-10 w-32"
                }, void 0, false, {
                    fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                    lineNumber: 28,
                    columnNumber: 13
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
            lineNumber: 25,
            columnNumber: 9
        }, this);
    }
    if (profile?.subscriptionStatus !== 'pro') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-lg mx-auto text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Alert"], {
                variant: "destructive",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertTitle"], {
                        children: "Pro Membership Required"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 38,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDescription"], {
                        children: "You need to be a Pro member to access the practice tests. Please upgrade your plan to continue."
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 39,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            asChild: true,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pricing",
                                children: "Upgrade to Pro"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                                lineNumber: 44,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                            lineNumber: 43,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 42,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
            lineNumber: 35,
            columnNumber: 8
        }, this);
    }
    if (!settings) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-lg mx-auto",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Alert"], {
                variant: "destructive",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__["Terminal"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 56,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertTitle"], {
                        children: "Invalid Test"
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 57,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AlertDescription"], {
                        children: "The test you are trying to access does not exist. Please go back and select a valid test."
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 58,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            asChild: true,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/tests",
                                children: "Go to Tests"
                            }, void 0, false, {
                                fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                                lineNumber: 63,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                            lineNumber: 62,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                        lineNumber: 61,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
                lineNumber: 55,
                columnNumber: 13
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
            lineNumber: 54,
            columnNumber: 9
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TestPageWrapper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TestPageClient$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            testId: testId,
            difficulty: difficulty,
            settings: settings
        }, void 0, false, {
            fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
            lineNumber: 73,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/tests/[testId]/[difficulty]/page.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=src_7b62d31d._.js.map