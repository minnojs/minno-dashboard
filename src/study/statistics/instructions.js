export default statisticsInstructions;

let statisticsInstructions = () => m('.text-muted', [
    m('p', 'Choose whether you want participation data from demo studies, research pool, all research studies (including lab studies), or all studies (demo and research).'),
    m('p', 'Enter the study id or any part of the study id (the study name that that appears in an .expt file). Note that the study id search feature is case-sensitive. If you leave this box blank you will get data from all studies.'),
    m('p', 'You can also use the Task box to enter a task name or part of a task name (e.g., realstart) if you only want participation data from certain tasks.'),
    m('p', 'You can also choose how you want the data displayed, using the "Show by" options. If you click "Study", you will see data from each study that meets your search criteria. If you also check "Task" you will see data from any study that meets your search criteria separated by task.  The "Data Group" option will allow you to see whether a given study is coming from the demo or research site.  '),
    m('p', 'You can define how completion rate is calculated by entering text to "First task" and "Last task". Only sessions that visited those tasks would be used for the calculation.'),
    m('p', 'When you choose to show the results by date, you will see all the studies that have at least one session in the requested date range, separated by day, week, month or year. This will also show dates with zero sessions. If you want to hide rows with zero sessions, select the "Hide empty" option.')
]);
