这是一个JS脚本，帮助被攻击的账户完成ARB空投的领取。

使用方法：

1.  $ npm install 安装。
2. 将私钥添加到.env-example 文件中 
a) 旧的泄漏帐户 
b) 另外的新的的安全帐户

3. 将.env-example文件名更改为.env。
4. 在 claim.js 文件中，将第40行的值更改为你可领取的ARB代币数量。

5. 前往https://beaconcha.in/ 实时监控第16890400个区块。
6. 在第16890400个区块时，运行 $ node claim.js。
7. 请勿事先将ETH存入受损账户中，否则黑客的机器人可能会将其窃取。
