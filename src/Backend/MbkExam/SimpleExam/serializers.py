from rest_framework import serializers 
from .models import Execution,Trade,SimpleExam



class ExecutionSerializer(serializers.ModelSerializer):
    trade_id = serializers.IntegerField(source='trade.id')

    class Meta : 
        model = Execution 
        fields = ("id","ex_id","trade_id","price","action","quantity","is_entry","is_exit","instrument","datetime")

class TradeSerializer(serializers.ModelSerializer):
    executions = serializers.SerializerMethodField()
    simpleexam_id = serializers.IntegerField(source="simple_exam.id")

    class Meta : 
        model = Trade 
        fields = ("id","simpleexam_id","pnl","action","instrument","entry_datetime","exit_datetime","entry_price","exit_price","executions")

    def get_executions(self,trade_obj):
        executions_qs = trade_obj.execution_set.all()
        serializer = ExecutionSerializer(executions_qs,many=True)
        return serializer.data 

class SimpleExamSerializer(serializers.ModelSerializer):
    trades = serializers.SerializerMethodField()
    class Meta: 
        model = SimpleExam 
        fields = ("title","trades")
    def get_trades(self,simple_exam_obj):
        trades_qs = simple_exam_obj.trade_set.all()
        serializer = TradeSerializer(trades_qs,many=True)
        return serializer.data 

