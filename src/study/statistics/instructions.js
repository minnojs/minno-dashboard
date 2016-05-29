export default statisticsInstructions;

let statisticsInstructions = () => m('.text-muted', [
    m('p', 'Choose whether you want participation data from the demo site, the research site, or both. You can also choose "current" (to get participation data from those studies that are in the pool right now), "history" (to get data from studies that have ever been in the research pool), or "any" (to get data from all research studies, regardless of whether or not they have ever been in the pool).'),
    m('p', 'Enter the study id or any part of the study id (the study name that that appears in an .expt file). Note that the study id search feature is case-sensitive. If you leave this box blank you will get data from all studies within your specified time period.'),
    m('p', 'You can also enter a task name or part of a task name (e.g., realstart) if you only want participation data from certain tasks. You can also choose how you want the data displayed. If you click "Study", you will see data from any study that meets your search criteria. If you also check "Task" you will see data from any study that meets your search criteria separated out by task. The "Data Group" option will allow you to see whether a given study is coming from the demo or research site.'),
    m('p', 'You can define how completion rate is calculated by setting "start" and "completed". Only studies that visited those tasks would be used in the calculation.')
]);
